

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
let reValue: RegExp = /(?<=:\s).*/;


interface Line {
    depth: number,  // Indent depth
    length: number, // Total length
    type: string | 'list item' | 'dict item' | 'string' | 'unidentified' | 'comment', // Type of line
    value: string,
    text: string,
    lineNo: number,
    key?: string
}

class Lines {
    lines: Array<string>
    nextLine: boolean | Line
    generator: Generator

    constructor(s: string) {
        this.lines = s.split('\n');
        this.generator = this.readLines()
        this.nextLine = this.generator.next().value
    }

    *readLines(): Generator<Line> {
        let lineNo = 1;
        let prevLine = null;

        do {
            yield this.readLine(this.lines[0], lineNo);
            this.lines = this.lines.slice(1);
            lineNo++;
        } while (this.nextLine)
    }

    readLine = (line: string, lineNo: number) : Line => {
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
        } else if (line[0] === '>') {
            type = 'string'
        } else if (line[0] === '#') {
            type = 'comment'
        } else if (line[0] !== '\n') {
            type = 'dict item'
            key = reKey.exec(line)[0]
            let valSearch = reValue.exec(line)
            if (valSearch) {
                value = valSearch[0] 
            } else {
                value = ''
            }
        } else {
            type = 'unidentified'
        }
        var retLine: Line = {depth: depth, length: length, type: type, value: value, text: text, lineNo: lineNo, key: key}
        return retLine
    }

    getNext() {
        var currentLine = this.nextLine;
        var next = this.generator.next();
        this.nextLine = next.value;
        return currentLine;
    }
}


// const readLines = (s: string) => {
//     let lines: Array<string> = s.split('\n');
//     var obj = {};

//     console.log(readDict(lines, 0))
//     // lines.forEach((line, index) => {
//     //     console.log('Line no. ' + index+1 + ' : ', readLine(line))
//     // })
// }

// const readNext = (lines: Array<string>, depth: number) => {
//     let line = lines[0]
//     switch ()
// }

// const readDict = (lines: Array<string>, depth: number, onDup?: Function) => {
//     let data = {}
//     let line: Line = readLine(lines[0])
//     while (line.depth > depth) {

//     }
//     if (line.key && line.key !== '') {
//         if (line.value && line.value !== '') {
//             data[line.key] = line.value
//         } else if (lines[1]) {
            
//         } else {
//             data[line.key] = ''
//         }
//     }
//     return data 
// }

// const readList = (lines: Array<string>, depth: number, onDup?: Function) => {

// }

// const readString = (lines: Array<string>, depth: number) => {

// }


//// TEST CODE! ////
var demo2 = 
`president:
    name: Wendy
    access: Total
    address:
        > 120 Woolbury St
        > QLD, 4444
`;

let lines = new Lines(demo2);
console.log(lines.getNext())
console.log(lines.getNext())
console.log(lines.getNext())
// readLines(demo2);
// console.log(obj)




