const _ = require("lodash");
const fs = require("node:fs");
const path = require("node:path");
// eslint-disable-next-line no-undef
const mainPath = path.dirname(path.dirname(path.dirname(__dirname)));

const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const Canvas = require("@napi-rs/canvas");

const { GAMEMODE } = require("../../../configs/gamemode.json");

module.exports = {
    /**
     * 연어런 스케줄 객체를 출력하는 임베드 메시지를 생성합니다.
     */
    async embedSalmonBuilder(schedule) {
        const { stages, bosses, weapons } = JSON.parse(
            fs.readFileSync(path.join(mainPath, "configs/ko-KR.json")),
        );

        const mode = _.get(
            GAMEMODE,
            `${schedule.mode.toUpperCase()}.name.${schedule.submode}`,
        );
        const [startTime, endTime] = getFormattedTimes(schedule);
        const stage = _.get(stages, `${schedule.stage}.name`);
        const boss = _.get(bosses, `${schedule.boss}.name`);
        const [weapon1, weapon2, weapon3, weapon4] = schedule.weapons.map(
            (weapon) => _.get(weapons, `${weapon}.name`),
        );

        const modeImage = await attachModeImage(
            `${schedule.mode}-${schedule.submode}`,
        );
        const stageImage = await attachStageImage(schedule.stage);

        const color = {
            regularSchedules: 0xec5e41,
            bigRunSchedules: 0xa431f6,
        };

        const scheduleInfoEmbed = new EmbedBuilder()
            .setColor(color[schedule.submode])
            .setTitle(mode)
            .setDescription(`${startTime} ~ ${endTime}`)
            .setThumbnail(`attachment://${modeImage.name}`)
            .addFields(
                { name: "스테이지", value: `${stage}`, inline: true },
                { name: "보스", value: `${boss}`, inline: true },
            )
            .addFields({
                name: "무기",
                value: `${weapon1} / ${weapon2} / ${weapon3} / ${weapon4}`,
            })
            .setImage(`attachment://${stageImage.name}`)
            .setTimestamp()
            .setFooter({ text: "Data access @splatoon3.ink" });

        return { embeds: [scheduleInfoEmbed], files: [stageImage, modeImage] };
    },
};

async function attachModeImage(fileName) {
    const canvas = Canvas.createCanvas(40, 40);
    const context = canvas.getContext("2d");
    try {
        const modeImg = await Canvas.loadImage(
            path.join(mainPath, `resources/images/mode/${fileName}.svg`),
        );
        context.drawImage(modeImg, 0, 0, canvas.width, canvas.height);
    } catch (error) {
        console.error(error);
    }
    return new AttachmentBuilder(await canvas.encode("png"), {
        name: "mode-image.png",
    });
}

async function attachStageImage(fileName) {
    const canvas = Canvas.createCanvas(400, 200);
    const context = canvas.getContext("2d");
    try {
        const stageImg = await Canvas.loadImage(
            path.join(mainPath, `resources/images/stages/${fileName}.png`),
        );
        context.drawImage(stageImg, 0, 0, canvas.width, canvas.height);
    } catch (error) {
        console.error(error);
    }
    return new AttachmentBuilder(await canvas.encode("png"), {
        name: "stage-image.png",
    });
}

function getFormattedTimes(schedule) {
    const dateFormat = {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Seoul",
    };
    const startTime = new Intl.DateTimeFormat("en-US", dateFormat).format(
        new Date(schedule.startTime),
    );
    const endTime = new Intl.DateTimeFormat("en-US", dateFormat).format(
        new Date(schedule.endTime),
    );
    return [startTime, endTime];
}
