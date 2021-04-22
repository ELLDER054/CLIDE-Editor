var number = 1;
var selected = "main.gizmo";
var ed = document.getElementById("custom-area");
var text = document.getElementById("RiseEditArea");
let backdrop = document.querySelector(".backdrop");
text.focus();

let tab_values =  {
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
            html += "<spam class=\"num\">" + num +"</spam>";
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
                html += "<spam class=\"str\">" + delimiter + str + delimiter +"</spam>";
            } else {
                html += "<spam class=\"str\">\"" + str + "</spam>";
            }
        } else if (isAlpha(c)) {
            let name = "";
            while (isAlpha(c)) {
                name += c;
                c = code[++pos];
            }
            const keys = ["write", "int", "string", "if", "return", "char"];
            if (keys.includes(name)) {
                html += "<spam class=\"key\">" + name + "</spam>";
                continue;
            }
            html += "<spam>" + name + "</spam>";
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
    tabs.innerHTML += "<span><button class=\"tab\" onclick=\"select(this.innerText);\">Untitled" + number + ".gizmo</button><button class=\"mini\" onclick=\"this.parentNode.childNodes[0].remove();this.parentNode.remove();this.remove();\">x</button></span>"
    tab_values["Untitled" + number + ".gizmo"] = "";
    selected = "Untitled" + number + ".gizmo";
    ed.innerText = tab_values[selected];
    text.value = tab_values[selected];
    ed.focus();
    number++;
}

function select(v) {
    tab_values[selected] = ed.innerText;
    selected = v;
    text.value = tab_values[selected];
    ed.innerText = tab_values[selected];
    ed.innerHTML = applyColors(text.value);
    text.focus();
}

text.addEventListener("input", function() {
    ed.innerHTML = applyColors(text.value);
});

text.addEventListener("scroll", function() {
    backdrop.scrollTop = text.scrollTop;
});
