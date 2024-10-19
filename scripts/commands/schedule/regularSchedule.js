const { SlashCommandBuilder } = require("discord.js");

const { GAMEMODE } = require("../../../configs/gamemode.json");
const replyBuilder = require("../../reply/replyBuilder.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("레귤러")
        .setDescription("스플래툰3 레귤러 매치 스케줄을 알려줍니다."),
    async execute(interaction) {
        await replyBuilder.scheduleReply(interaction, GAMEMODE.REGULAR);
    },
};
