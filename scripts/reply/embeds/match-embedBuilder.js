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
     * PVP 매치 스케줄 객체를 출력하는 임베드 메시지를 생성합니다.
     */
    async embedMatchBuilder(schedule) {
        const { stages, rules } = JSON.parse(
            fs.readFileSync(path.join(mainPath, "configs/ko-KR.json")),
        );

        const mode = _.get(GAMEMODE, `${schedule.mode.toUpperCase()}.name`);
        const [startTime, endTime] = getFormattedTimes(schedule);
        const rule = _.get(rules, `${schedule.rule}.name`);
        const [stage1, stage2] = schedule.stages.map((x) =>
            _.get(stages, `${x}.name`),
        );

        const modeImage = await attachModeImage(schedule.mode);
        const stagesImage = await attachStagesImage(schedule.stages);

        const color = {
            regular: 0xd7f556,
            challenge: 0xe2572c,
            open: 0xe2572c,
            x: 0x6adaa4,
        };

        const scheduleInfoEmbed = new EmbedBuilder()
            .setColor(color[schedule.mode])
            .setTitle(mode)
            .setDescription(`${startTime} ~ ${endTime}`)
            .setThumbnail(`attachment://${modeImage.name}`)
            .addFields({ name: "룰", value: `${rule}` })
            .addFields({ name: "스테이지", value: `${stage1} / ${stage2}` })
            .setImage(`attachment://${stagesImage.name}`)
            .setTimestamp()
            .setFooter({ text: "Data access @splatoon3.ink" });

        return { embeds: [scheduleInfoEmbed], files: [stagesImage, modeImage] };
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

async function attachStagesImage(fileNames) {
    const canvas = Canvas.createCanvas(800, 200);
    const context = canvas.getContext("2d");
    try {
        const [filePath1, filePath2] = fileNames.map((fileName) =>
            path.join(mainPath, `resources/images/stages/${fileName}.png`),
        );
        const stageImg1 = await Canvas.loadImage(filePath1);
        const stageImg2 = await Canvas.loadImage(filePath2);

        context.drawImage(stageImg1, 0, 0, 400, 200);
        context.drawImage(stageImg2, 400, 0, 400, 200);
    } catch (error) {
        console.error(error);
    }
    return new AttachmentBuilder(await canvas.encode("png"), {
        name: "stages-image.png",
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
