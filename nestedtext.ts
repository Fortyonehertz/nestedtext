

// Globals
const all: Array<string> = ['load', 'loads', 'dump', 'dumps', 'NestedTextError'];

const demo = 
`president:
    name: Katheryn McDaniel
    address:
        > 138 Almond Street
        > Topeka, Kansas 20697
    phone:
        cell: 1-210-555-5297
        home: 1-210-555-8470
            # Katheryn prefers that we always call her on her cell phone.
    email: KateMcD@aol.com
    additional roles:
        - board member
`;

let reSeperator: RegExp = /:/;
let reOptWhitespace: RegExp = /\s/;
let reKey: RegExp = /[^:]*/;
let reDictValue: RegExp = /(?<=:\s).*/;
let reListValue: RegExp = /(?<=-\s).*/;
let reStringValue: RegExp = /(?<=>\s).*/;


interface Line {
    depth: number,  // Indent depth
    length: number, // Total length
    type: string | 'list item' | 'dict item' | 'string item' | 'unidentified' | 'comment' | "blank", // Type of line
    value: string,
    text: string,
    lineNo: number,
    key?: string,
    prevLine?: Line
}

class Lines {
    lines: Array<string>
    nextLine: Line
    generator: Generator

    constructor(s: string) {
        this.lines = s.split('\n');
        this.generator = this.readLines()
        this.nextLine = this.getNext();
    }

    *readLines(): Generator<Line> {
        let lineNo = 1;
        do {
            yield this.readLine(this.lines[0], lineNo);
            this.lines = this.lines.slice(1);
            lineNo++;
        } while (this.nextLine !== undefined && this.lines.length > 0)
        return;
    }

    readLine = (line: string, lineNo: number) : Line => {
        let prevLine = null;
        var depth = 0;
        var length = line.length;
        var type = 'unidentified';
        var text = line;
        let key = '';
        while (reOptWhitespace.test(line[0])) {
            depth++;
            line = line.slice(1, line.length);
        }
        var value: string = line;
        if (line[0] === '-') {
            type = 'list item'
            value = reListValue.exec(line)[0]
        } else if (line[0] === '>') {
            type = 'string item'
            value = reStringValue.exec(line)[0]
        } else if (line[0] === '#') {
            type = 'comment'
        } else if (line == "" || line[0] === '\n') {
            type = 'blank'
        } else if (line[0] !== '\n') {
            type = 'dict item'
            key = reKey.exec(line)[0]
            let valSearch = reDictValue.exec(line)
            if (valSearch) {
                value = valSearch[0] 
            } else {
                value = ''
            }
        } else {
            type = 'unidentified'
        }
        if (type.endsWith(' item') && this.nextLine !== undefined) {
            prevLine = this.nextLine
        }

        var retLine: Line = {depth: depth, length: length, type: type, value: value, text: text, lineNo: lineNo, key: key, prevLine: prevLine}
        return retLine
    }

    getNext() {
        if (!this.nextLine) {
            do {
                var next = this.generator.next();
                if (next.value === undefined) {
                    this.nextLine = null;
                } else {
                    this.nextLine = next.value;
                }
                if (this.nextLine === null) {
                    break;
                }
            } while (
                this.nextLine.type === "comment" ||
                this.nextLine.type === "blank"
            )
            return this.nextLine
        }
        var currentLine = this.nextLine;
        do {
            var next = this.generator.next();
            if (next.value === undefined) {
                this.nextLine = null;
            } else {
                this.nextLine = next.value;
            }
            if (this.nextLine === null) {
                break;
            }
        } while (
            this.nextLine.type === "comment" ||
            this.nextLine.type === "blank"
        )
        return currentLine;
    }

    typeOfNext() {
        if (this.nextLine) {
            return this.nextLine.type
        }
    }

    withinLevel(depth: number) {
        if (this.nextLine) {
            return this.nextLine.depth >= depth
        }
    }

    withinString(depth: number) {
        if (this.nextLine) {
            return (
                this.nextLine.type == "string item" &&
                this.nextLine.depth >= depth
            )
        }
    }

    depthOfNext() {
        if (this.nextLine) {
            return this.nextLine.depth
        }
        return 0;
    }
}

const readValue = (lines: Lines, depth: number, onDup?: Function): any => {
    switch (lines.typeOfNext()) {
        case "list item":
            return readList(lines, depth, onDup)
        case "dict item":
            return readDict(lines, depth, onDup)
        case "string item":
            return readString(lines, depth)
        default:
            //TODO: Throw error / alert and go next line
            console.log('Unrecognised line!')
            lines.getNext()
    }
}

const readList = (lines: Lines, depth: number, onDup?: Function) => {
    let data = [];
    while (lines.withinLevel(depth)) {
        let line = lines.getNext()
        if (line.depth != depth) {
            // TODO ERROR: Indentation error
        }
        if (line.type !== "list item") {
            // TODO ERROR: Expected another list item
        }
        if (line.value) {
            data.push(line.value)
        } else {
            // Value empty or on next line
            let nextDepth = lines.depthOfNext()
            let value = ''
            if (nextDepth > depth) {
                value = readValue(lines, nextDepth, onDup)
            }
            data.push(value)
        }
    }
    return data
}

const readDict = (lines: Lines, depth: number, onDup?: Function) => {
    let data: object = {}
    while (lines.withinLevel(depth)) {
        let line = lines.getNext()
        if (line.depth !== depth) {
            // TODO: indentation err
        }
        if (line.type !== "dict item") {
            // TODO: Expected dictionary item
        }
        let key = line.key
        let value = line.value
        if (!value) { //TODO: Might need to check for previously empty.
            let nextDepth = lines.depthOfNext()
            if (nextDepth > depth) {
                value = readValue(lines, nextDepth, onDup)
            } else {
                value = ''
            }
        }
        // if (data[line.key] !== undefined) { // TODO: Check for key existence
        //     if (!onDup) {
        //         // TODO: Report 'duplicate key'
        //     }
        //     if (onDup === "ignore") {
        //         continue;
        //     }
        //     // TODO: Find whether onDup is a dictionary/obj and call the callback func provided
        //     // Then assert key not in data
        //     else if (onDup !== 'replace') {

        //     }
        // }
        data[key] = value
    }
    return data
}

const readString = (lines: Lines, depth: number) => {
    let data: Array<string> = []
    while (lines.withinString(depth)) {
        let line = lines.getNext()
        data.push(line.value)
        if (line.depth != depth) {
            //TODO: Indentation error
        }
    }
    return data.join("\n")

}



    ////////////////////////////////
   ////////// GRAVEYARD ///////////
  ////////////////////////////////

// const readLines = (s: string) => {
//     let lines: Array<string> = s.split('\n');
//     var obj = {};

//     console.log(readDict(lines, 0))
//     // lines.forEach((line, index) => {
//     //     console.log('Line no. ' + index+1 + ' : ', readLine(line))
//     // })
// }


// 



//// TEST CODE! ////
var demo2 = 
`president:
    name: Wendy
    access: Total
    address:
        > 120 Woolbury St
        > QLD, 4444
`;


var demo3 = 
`- Item 1
- Item 2
- Item 3
- Item 4`

var demo4 =
`
  > Hello, My name is: Michael
  > This is how this works!
  >    A multiline string!
`

let lines = new Lines(demo);
console.log(readValue(lines, 0))
// console.log(lines.getNext())
// console.log(lines.getNext())
// console.log(lines.getNext())
// console.log(lines.getNext())
// readLines(demo2);
// console.log(obj)




