import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { basicSetup } from "codemirror";

let startState = EditorState.create({
  doc: "print('¡Hola, mundo!')",
  extensions: [basicSetup, keymap.of(defaultKeymap), python()]
});

let view = new EditorView({
  state: startState,
  parent: document.getElementById('editor')
});

async function loadPyodideAndRun() {
  let pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.21.0/full/" });

  document.getElementById('run').addEventListener('click', async () => {
    let code = view.state.doc.toString();
    try {
      let result = await pyodide.runPythonAsync(code);
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  });
}

loadPyodideAndRun();
