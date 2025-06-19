import * as vscode from "vscode";
import { tips } from "./tips";

const extensionName = "pragmaticToaster";
const minConfigName = "minSaves";
const maxConfigName = "maxSaves";

export function activate(context: vscode.ExtensionContext) {
  let nextTipCountdown = getNextCountdown();

  // Show a Tip on demand
  const disposable = vscode.commands.registerCommand(
    "pragmatic-toaster.pragmaticTip",
    () => {
      showPragmaticTip(tips[getRandomInRange(0, tips.length - 1)]);
      nextTipCountdown = getNextCountdown();
    }
  );

  context.subscriptions.push(disposable);

  // Show a tip every few saves
  vscode.workspace.onDidSaveTextDocument(() => {
    --nextTipCountdown;

    if (nextTipCountdown === 0) {
      showPragmaticTip(tips[getRandomInRange(0, tips.length - 1)]);
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
       No toasts for today, until you fix the settings!`,
      "OK"
    );
    return -1;
  }

  return getRandomInRange(min, max);
}

function getRandomInRange(lower: number, upper: number) {
  const range = upper - lower;
  const offset = lower;
  return Math.round(Math.random() * range + offset);
}

function showPragmaticTip(tip: Tip) {
  vscode.window.showInformationMessage(
    `${tip?.title}: ${tip?.extra} ${tip?.number}.`,
    "OK"
  );
}

interface Tip {
  title: string;
  extra: string;
  number: string;
}
