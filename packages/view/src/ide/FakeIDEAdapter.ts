﻿import { injectable } from "tsyringe";

import type { IDEMessage, IDEMessageEvent } from "types";
import type { IDESentEvents } from "types/IDESentEvents";

import fakeData from "../fake-assets/cluster-nodes.json";
import fakeBranchList from "../fake-assets/branch-list.json";

import type IDEPort from "./IDEPort";

@injectable()
export default class FakeIDEAdapter implements IDEPort {
  public addIDESentEventListener(events: IDESentEvents) {
    const onReceiveMessage = (e: IDEMessageEvent): void => {
      const responseMessage = e.data;
      const { command, payload } = responseMessage;

      switch (command) {
        case "fetchAnalyzedData":
          return events.handleChangeAnalyzedData(payload ? JSON.parse(payload) : undefined);
        case "fetchBranchList":
          return events.handleChangeBranchList(payload ? JSON.parse(payload) : undefined);
        case "fetchGithubInfo":
          return events.handleGithubInfo(payload ? JSON.parse(payload) : undefined);
        default:
          console.log("Unknown Message");
      }
    };

    window.addEventListener("message", onReceiveMessage);
  }

  public sendRefreshDataMessage(payload?: string) {
    const message: IDEMessage = {
      command: "refresh",
      payload,
    };
    this.sendMessageToMe(message);
  }

  public sendFetchAnalyzedDataMessage(payload?: string) {
    const message: IDEMessage = {
      command: "fetchAnalyzedData",
      payload,
    };
    setTimeout(() => {
      // loading time을 시뮬레이션 하기 위함
      this.sendMessageToMe(message);
    }, 1500);
  }

  public sendFetchBranchListMessage() {
    const message: IDEMessage = {
      command: "fetchBranchList",
    };
    this.sendMessageToMe(message);
  }

  public sendFetchGithubInfo() {
    const message: IDEMessage = {
      command: "fetchGithubInfo",
    };
    this.sendMessageToMe(message);
  }

  public sendUpdateThemeMessage(theme: string) {
    sessionStorage.setItem("THEME", theme);
    const message: IDEMessage = {
      command: "updateTheme",
    };
    this.sendMessageToMe(message);
  }

  private convertMessage(message: IDEMessage) {
    const { command } = message;

    switch (command) {
      case "fetchAnalyzedData":
        return {
          command,
          payload: JSON.stringify(fakeData),
        };
      case "fetchBranchList":
        return {
          command,
          payload: JSON.stringify(fakeBranchList),
        };
      case "updateTheme":
        return {
          command,
          payload: sessionStorage.getItem("CUSTOM_THEME") as string,
        };
      default:
        return {
          command,
        };
    }
  }

  private sendMessageToMe(message: IDEMessage) {
    window.postMessage(this.convertMessage(message));
  }
}
