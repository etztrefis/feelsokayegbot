import { Bot, cmdData } from "../types";
import * as pc from "picocolors";
import * as fs from "fs";

export const command = {
  name: "yourmom",
  active: true,
  cooldown: 5000,
  author_permission: false,
  aliases: ["mom"],
  run: async (context: cmdData, okayeg: Bot) => {
    let result: string;
    try {
      const data = fs.readFileSync("./data/mom_jokes.json");
      const dataValues = JSON.parse(data.toString());
      const values = Object.values(dataValues.data);
      const random = Math.floor(Math.random() * values.length);
      const randomValue = values[random];

      const messageArgs = context.message?.args;
    if (messageArgs[0]) {
        if (messageArgs[0].charAt(0) === "@") {
          result = `${messageArgs[0]}, ${randomValue} forsenHead`;
        } else {
          result = `@${messageArgs[0]}, ${randomValue} forsenHead`;
        }
      } else {
        result = `@${context.user.name}, ${randomValue} forsenHead`;
      }
      await okayeg.CommandUtils.send(context.channel, result, context);
    } catch (error) {
      okayeg.Logger.warn(`${pc.yellow("[MOM COMMAND]")} || Error ${error}`);
      result = "Error while reading data file 😔";
      await okayeg.CommandUtils.send(context.channel, result, context);
    }
  },
};
