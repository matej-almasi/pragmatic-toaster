import * as fs from "fs";
import path from "path";
import * as vscode from "vscode";

const extensionName = "pragmaticToaster";
const minConfigName = "minSaves";
const maxConfigName = "maxSaves";

export function activate(context: vscode.ExtensionContext) {
  let tips = loadTips(context);

  let nextTipCountdown = getNextCountdown();

  vscode.workspace.onDidSaveTextDocument(() => {
    --nextTipCountdown;

    if (nextTipCountdown === 0) {
      try {
        tips = loadTips(context);
      } catch (err) {
        showFailedLoadingMessage(err);
        return;
      }

      showPragmaticTip(tips);
      nextTipCountdown = getNextCountdown();
    }
  });

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (
      event.affectsConfiguration(`${extensionName}.${minConfigName}`) ||
      event.affectsConfiguration(`${extensionName}.${maxConfigName}`)
    ) {
      nextTipCountdown = getNextCountdown();
    }
  });

  const disposable = vscode.commands.registerCommand(
    "pragmatic-toaster.pragmaticTip",
    () => {
      try {
        tips = loadTips(context);
      } catch (err) {
        showFailedLoadingMessage(err);
        return;
      }

      showPragmaticTip(tips);
      nextTipCountdown = getNextCountdown();
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

function loadTips(context: vscode.ExtensionContext): Tip[] {
  const tipsPath = path.join(context.extensionPath, "resources", "tips.json");

  const data = fs.readFileSync(tipsPath);
  const parsed = JSON.parse(data.toString());

  if (!parsed.length) {
    throw RangeError("No Tips found in the Tip File!");
  }

  return randomPermutation(parsed.length).map((i) => parsed[i]);
}

interface Tip {
  title: string;
  extra: string;
  number: string;
}

function randomPermutation(n: number) {
  const arr = Array.from({ length: n }, (_, i) => i);

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function getNextCountdown(): number {
  const config = vscode.workspace.getConfiguration(extensionName);
  const min = config.get<number>(minConfigName, 5);
  const max = config.get<number>(maxConfigName, 10);

  if (max < min) {
    vscode.window.showWarningMessage(
      `Pragmatic Toaster ${maxConfigName} is lower than ${minConfigName}.\
     No toasts for today, until you fix the settings!`
    );
    return -1;
  }

  return getRandomFromRange(min, max);
}

function getRandomFromRange(lower: number, upper: number) {
  const range = upper - lower;
  const offset = lower;
  return Math.round(Math.random() * range + offset);
}

function showFailedLoadingMessage(err: unknown) {
  const message = "Failed loading Pragmatic Tips";
  console.error(`${message}: ${err}`);
  vscode.window.showErrorMessage(message);
}

function showPragmaticTip(tips: Tip[]) {
  const tip = tips.pop();
  vscode.window.showInformationMessage(
    `${tip?.title}: ${tip?.extra} ${tip?.number}.`,
    "OK"
  );
}
