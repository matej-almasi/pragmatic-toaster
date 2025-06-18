import * as fs from "fs";
import path from "path";
import * as vscode from "vscode";

const extensionName = "pragmaticToaster";
const minConfigName = "minSaves";
const maxConfigName = "maxSaves";

export function activate(context: vscode.ExtensionContext) {
  let nextTipCountdown = getNextCountdown();

  // Show a Tip on demand
  const disposable = vscode.commands.registerCommand(
    "pragmatic-toaster.pragmaticTip",
    () => {
      showPragmaticTip(context);
      nextTipCountdown = getNextCountdown();
    }
  );

  context.subscriptions.push(disposable);

  // Show a tip every few saves
  vscode.workspace.onDidSaveTextDocument(() => {
    --nextTipCountdown;

    if (nextTipCountdown === 0) {
      showPragmaticTip(context);
      nextTipCountdown = getNextCountdown();
    }
  });

  // Update countdown when the settings change
  vscode.workspace.onDidChangeConfiguration((event) => {
    if (
      event.affectsConfiguration(`${extensionName}.${minConfigName}`) ||
      event.affectsConfiguration(`${extensionName}.${maxConfigName}`)
    ) {
      nextTipCountdown = getNextCountdown();
    }
  });
}

function getNextCountdown(): number {
  const config = vscode.workspace.getConfiguration(extensionName);
  let min = config.get<number>(minConfigName, 5);
  const max = config.get<number>(maxConfigName, 10);

  // having min === 0 and max > 0 could lead to randomly setting
  // the countdown to 0 which would lead to no longer showing any
  // tips on file save
  if (min === 0 && max > 0) {
    min = 1;
  }

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

function showPragmaticTip(context: vscode.ExtensionContext) {
  let tips;

  try {
    tips = loadTips(context);
  } catch (err) {
    // should never happen as we control the extension files,
    // but one can never be sure...
    showFailedLoadingMessage(err);
    return;
  }

  const tip = tips.pop();
  vscode.window.showInformationMessage(
    `${tip?.title}: ${tip?.extra} ${tip?.number}.`,
    "OK"
  );
}

function showFailedLoadingMessage(err: unknown) {
  const message = "Failed loading Pragmatic Tips";
  console.error(`${message}: ${err}`);
  vscode.window.showErrorMessage(message);
}

interface Tip {
  title: string;
  extra: string;
  number: string;
}

function loadTips(context: vscode.ExtensionContext): Tip[] {
  const tipsPath = path.join(context.extensionPath, "resources", "tips.json");

  const data = fs.readFileSync(tipsPath);
  const parsed = JSON.parse(data.toString());

  if (!parsed.length) {
    throw RangeError("No Tips found in the Tip File!");
  }

  return randomPermutation(parsed.length).map((i) => parsed[i]);
}

function randomPermutation(n: number) {
  const arr = Array.from({ length: n }, (_, i) => i);

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}
