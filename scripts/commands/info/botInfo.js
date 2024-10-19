const { SlashCommandBuilder } = require("discord.js");
const replyBuilder = require("../../reply/replyBuilder.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("만타봇")
        .setDescription("만타봇 정보를 알려줍니다."),
    async execute(interaction) {
        await replyBuilder.infoReply(interaction);
    },
};
