var number = 1;
var selected = "main.gizmo";
var mode = "Elflord";
var ed = document.getElementById("front");
var text = document.getElementById("editor");
var backdrop = document.querySelector(".backdrop");
var modeSelect = document.getElementById("mode");
text.focus();

var tab_values =  {
    "main.gizmo": "",
};

function isDigit(c) {
    return c >= '0' && c <= '9';
}

function isAlpha(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

function lex(code) {
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
            html += "<span class=\"num_" + mode + "\">" + num +"</span>";
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
                html += "<span class=\"str_" + mode + "\">" + delimiter + str + delimiter +"</span>";
            } else {
                html += "<span class=\"str_" + mode + "\">" + delimiter + str + "</span>";
            }
        } else if (isAlpha(c)) {
            let name = "";
            while (isAlpha(c) || isDigit(c)) {
                name += c;
                c = code[++pos];
            }
            const keys = ["write", "if", "else", "return", "while", "new", "class", "read", "in", "for", "init", "or", "and", "not", "function"];
            const types = ["int", "string", "char", "none", "const"]
            if (keys.includes(name)) {
                html += "<span class=\"key_" + mode + "\">" + name + "</span>";
                continue;
            } else if (types.includes(name)) {
                html += "<span class=\"type_" + mode + "\">" + name + "</span>";
                continue;
            }
            html += "<span>" + name + "</span>";
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
            html += "<span class=\"com_" + mode + "\">" + comment + "</span>"
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

function newTab() {
    if (selected === "main.gizmo") {
        tab_values["main.gizmo"] = ed.innerText
    }
    tabs.innerHTML += "<span><button class=\"tab\" onclick=\"select(this.innerText);\">Untitled" + number + ".gizmo</button><button class=\"mini\" onclick=\"ed.innerText = tab_values['main.gizmo'];text.value = tab_values['main.gizmo'];delete tab_values[this.parentNode.childNodes[0].value];select('main.gizmo');this.parentNode.childNodes[0].remove();this.parentNode.remove();this.remove();\">x</button></span>"
    tab_values["Untitled" + number + ".gizmo"] = "";
    selected = "Untitled" + number + ".gizmo";
    ed.innerText = tab_values[selected];
    ed.innerHTML = "<code>" + ed.innerText + "</code>";
    text.value = tab_values[selected];
    ed.focus();
    number++;
}

function select(v) {
    tab_values[selected] = ed.innerText;
    selected = v;
    text.value = tab_values[selected];
    ed.innerHTML = "<code>" + applyColors(text.value) + "</code>";
    text.focus();
}

text.addEventListener("input", function() {
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

text.addEventListener("scroll", function() {
    backdrop.scrollTop = text.scrollTop;
});

const bgs = {
    "Seascape": "#272725",
    "Elflord": "#000000",
}

modeSelect.addEventListener("input", function() {
    mode = modeSelect.value;
    ed.style.backgroundColor = bgs[modeSelect.value];
    ed.innerHTML = "<code>" + applyColors(text.value) + "</code>";
});
