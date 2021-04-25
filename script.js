var number = 1;
var selected = "main.gizmo";
var mode = "Elflord";
var ed = document.getElementById("front");
var text = document.getElementById("editor");
var backdrop = document.querySelector(".backdrop");
var modeSelect = document.getElementById("mode");
text.focus();

var tab_values = {
    "main.gizmo": "",
};

// syntax highlighting
function isDigit(c) {
    return c >= '0' && c <= '9';
}

function isAlpha(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

function lex(code) {
    const operators = ["+", "-", "*", "/", "=", '.'];
    let html = "";
    let pos = 0;
    while (pos < code.length) {
        let c = code[pos];
        if (isDigit(c)) {
            let num = "";
            while (isDigit(c)) {
                num += c;
                c = code[++pos];
            }
            html += "<span class=\"num_" + mode + "\">" + num + "</span>";
        } else if (c === '"' || c === "'") {
            let str = "";
            let delimiter = c;
            let found = false;
            c = code[++pos];
            while (pos < code.length) {
                if (c === delimiter) {
                    found = true;
                    break;
                }
                str += c;
                c = code[++pos];
            }
            c = code[++pos];
            if (found) {
                html += "<span class=\"str_" + mode + "\">" + delimiter + str + delimiter + "</span>";
            } else {
                html += "<span class=\"str_" + mode + "\">" + delimiter + str + "</span>";
            }
        } else if (isAlpha(c)) {
            let name = "";
            while (isAlpha(c) || isDigit(c)) {
                name += c;
                c = code[++pos];
            }
            const keys = ["write", "if", "else", "return", "while", "new", "class", "read", "in", "for", "init", "or", "and", "not", "con", "include", "as", "this"];
            const types = ["int", "string", "char", "none"]
            if (keys.includes(name)) {
                html += "<span class=\"key_" + mode + "\">" + name + "</span>";
            } else if (types.includes(name)) {
                html += "<span class=\"type_" + mode + "\">" + name + "</span>";
            } else {
                html += "<span>" + name + "</span>";
            }
        } else if (operators.includes(c)) {
            html += "<span class=\"oper_" + mode + "\">" + c + "</span>";
            pos++;
        } else if (c === '\\') {
            let comment = "\\";
            c = code[++pos];
            while (pos < code.length) {
                if (c === '\n') {
                    break;
                }
                comment += c;
                c = code[++pos];
            }
            html += "<span class=\"com_" + mode + "\">" + comment + "</span>";
        } else {
            html += c;
            pos++;
        }
    }
    return html;
}

function applyColors(text) {
    let code = lex(text);
    return code;
}

// tab control
function newTab() {
    if (selected === "main.gizmo") {
        tab_values["main.gizmo"] = ed.innerText
    }
    tabs.innerHTML += "<span><button class=\"tab\" onclick=\"select(this.innerText);\">Untitled" + number + ".gizmo</button><button class=\"mini\" onclick=\"ed.innerText = tab_values['main.gizmo'];text.value = tab_values['main.gizmo'];delete tab_values[this.parentNode.childNodes[0].value];select('main.gizmo');this.parentNode.childNodes[0].remove();this.parentNode.remove();this.remove();\">x</button></span>";
    for (const tab of document.getElementsByClassName("tab")) {
        tab.style.backgroundColor = bgs[modeSelect.value];
        tab.style.color = fgs[modeSelect.value];
    }
    for (const min of document.getElementsByClassName("mini")) {
        min.style.backgroundColor = bgs[modeSelect.value];
        min.style.color = fgs[modeSelect.value];
    }
    modeSelect.style.backgroundColor = bgs[mode];
    tab_values["Untitled" + number + ".gizmo"] = "";
    selected = "Untitled" + number + ".gizmo";
    ed.innerText = tab_values[selected];
    ed.innerHTML = "<code>" + ed.innerText + "</code>";
    text.value = tab_values[selected];
    number++;
}

function select(v) {
    if (selected === v) {
        text.focus();
        return;
    }
    tab_values[selected] = ed.innerText;
    selected = v;
    text.value = tab_values[selected];
    text.focus();
    let s = applyColors(text.value).split("\n");
    let code = "";
    for (const line of s) {
        if (line === "") {
            code += "<code>\n</code>";
        } else {
            code += "<code>" + line + "</code>";
        }
    }
    ed.innerHTML = code;
}

// on changed input
text.addEventListener("input", function () {
    let s = applyColors(text.value).split("\n");
    let code = "";
    for (const line of s) {
        if (line === "") {
            code += "<code>\n</code>";
        } else {
            code += "<code>" + line + "</code>";
        }
    }
    ed.innerHTML = code;
});

// matching pairs
function getCaretPosition(ctrl) {
    // IE < 9 Support 
    if (document.selection) {
        ctrl.focus();
        var range = document.selection.createRange();
        var rangelen = range.text.length;
        range.moveStart('character', -ctrl.value.length);
        var start = range.text.length - rangelen;
        return start;
    } // IE >=9 and other browsers
    else if (ctrl.selectionStart || ctrl.selectionStart == '0') {
        return ctrl.selectionStart;
    } else {
        return 0;
    }
}

function insert(pos, c) {
    text.value = text.value.slice(0, pos) + c + text.value.slice(pos);
}

function un_insert(pos, c1, c2) {
    if (text.value[pos - 1] === c1 && text.value[pos] === c2) {
        text.value = text.value.slice(0, pos - 1) + text.value.slice(pos);
        setCaretPosition(text, pos, pos);
    }
}
 
function setCaretPosition(ctrl, start, end) {

    if (ctrl.setSelectionRange) {
        ctrl.focus();
        ctrl.setSelectionRange(start, end);
    }

    else if (ctrl.createTextRange) {
        var range = ctrl.createTextRange();
        range.collapse(true);
        range.moveEnd('character', end);
        range.moveStart('character', start);
        range.select();
    }
}

function resetColors() {
    let s = applyColors(text.value).split("\n");
    let code = "";
    for (const line of s) {
        if (line === "") {
            code += "<code>\n</code>";
        } else {
            code += "<code>" + line + "</code>";
        }
    }
    ed.innerHTML = code;
}

text.addEventListener("keydown", function (e) {
    const pairs = {
        '[': ']',
        '(': ')',
        '"': '"',
        "'": "'",
        '{': '\n}',
    }
    if (Object.keys(pairs).includes(e.key)) {
        const pos = getCaretPosition(text);
        insert(pos, pairs[e.key]);
        setCaretPosition(text, pos, pos);
        resetColors();
    } else if (Object.values(pairs).includes(e.key)) {
        const pos = getCaretPosition(text);
        if (text.value[pos] === e.key) {
            e.preventDefault();
        }
        setCaretPosition(text, pos + 1, pos + 1);
        resetColors();
    } else if (e.which === 9) {
        e.preventDefault();
        const pos = getCaretPosition(text);
        insert(pos, "   ")
        setCaretPosition(text, pos + 2, pos + 2);
        resetColors();
    } else if (e.which === 8) {
        const pos = getCaretPosition(text);
        if (Object.keys(pairs).includes(text.value[pos - 1])) {
            un_insert(pos, text.value[pos - 1], pairs[text.value[pos - 1]]);
            resetColors();
        }
    }
});

// scroll
text.addEventListener("scroll", function () {
    backdrop.scrollTop = text.scrollTop;
    ed.scrollTop = text.scrollTop;
});

// on changed input
const bgs = {
    "Seascape": "#272725",
    "Elflord": "#000000",
    "Springfield": "#FFFFFF",
}

const fgs = {
    "Seascape": "#FFFFFF",
    "Elflord": "#FFFFFF",
    "Springfield": "#000000",
}

modeSelect.addEventListener("input", function () {
    mode = modeSelect.value;
    for (const tab of document.getElementsByClassName("tab")) {
        tab.style.backgroundColor = bgs[mode];
        tab.style.color = fgs[mode];
    }
    for (const min of document.getElementsByClassName("mini")) {
        min.style.backgroundColor = bgs[mode];
        min.style.color = fgs[mode];
    }
    modeSelect.style.backgroundColor = bgs[mode];
    modeSelect.style.color = fgs[mode];
    ed.style.backgroundColor = bgs[mode];
    ed.style.color = fgs[mode];
    let s = applyColors(text.value).split("\n");
    let code = "";
    for (const line of s) {
        if (line === "") {
            code += "<code>\n</code>";
        } else {
            code += "<code>" + line + "</code>";
        }
    }
    ed.innerHTML = code;
});
