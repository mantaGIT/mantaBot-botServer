const fs = require("node:fs");
const path = require("node:path");
// eslint-disable-next-line no-undef
const mainPath = path.dirname(path.dirname(path.dirname(__dirname)));

const { inlineCode } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    /**
     * 봇 정보를 출력하는 임베드 메시지를 생성합니다.
     */
    async embedInfoBuilder() {
        const cmdsFilePath = path.join(
            mainPath,
            "resources/data/info/commands.json",
        );
        const cmdsFile = fs.readFileSync(cmdsFilePath);
        const cmdList = JSON.parse(cmdsFile);
        const cmdDescriptions = cmdList.map(
            (info) => `- ${inlineCode(info.cmd)} : ${info.description}`,
        );

        const infoEmbed = new EmbedBuilder()
            .setColor(0x568ea8)
            .setTitle("만타봇")
            .setDescription(
                "개발 진행 중인 봇이라 명령어가 변경될 수 있어요.\n사용 가능 명령어 목록은 아래 확인해주세요.",
            )
            .addFields({
                name: "명령어",
                value: `${cmdDescriptions.join("\n")}`,
            })
            .setTimestamp()
            .setFooter({
                text: "버그 제보 대환영",
            });

        return { embeds: [infoEmbed] };
    },
};
