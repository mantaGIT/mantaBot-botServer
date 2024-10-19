const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

const schedHandler = require("../data/schedule-data-handler.js");
const { GAMEMODE } = require("../../configs/gamemode.json");
const { embedMatchBuilder } = require("./embeds/match-embedBuilder.js");
const { embedSalmonBuilder } = require("./embeds/salmon-embedBuilder.js");
const { embedInfoBuilder } = require("./embeds/info-embedBuilder.js");

module.exports = {
    // ex. gamemode = GAMEMODE.REGULAR
    async scheduleReply(interaction, gamemode) {
        await interaction.deferReply();

        const schedules = schedHandler.loadSchedules(gamemode);
        if (schedules === undefined)
            throw new Error("cannot load schedule json file.");

        const schedNow = schedHandler.getScheduleNow(schedules);
        if (schedNow === undefined)
            throw new Error("cannot find schedule now.");

        const embedBuilder =
            gamemode.mode === GAMEMODE.SALMON.mode
                ? embedSalmonBuilder
                : embedMatchBuilder;

        const schedEmbed = await embedBuilder(schedNow);

        // 스케줄의 시작 시간만 표시, 2024년 08월 20일 21:00와 같은 형식
        const dateFormat = {
            dateStyle: "long",
            timeStyle: "short",
            hour12: false,
            timeZone: "Asia/Seoul",
        };
        const schedTimeList = schedules
            .map((schedule) => {
                const startTime = new Intl.DateTimeFormat(
                    "ko-KR",
                    dateFormat,
                ).format(new Date(schedule.startTime));
                return { id: String(schedule.id), time: `${startTime}` };
            })
            .filter((schedTime) => schedTime.id >= schedNow.id);

        const schedTimeMenu = new StringSelectMenuBuilder()
            .setCustomId("scheduleTime")
            .setPlaceholder("스케줄 시작 시간을 선택해주세요.")
            .addOptions(
                schedTimeList.map((schedTime) => {
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(schedTime.time)
                        .setValue(schedTime.id);
                }),
            );

        const menuRow = new ActionRowBuilder().addComponents(schedTimeMenu);

        const prev = new ButtonBuilder()
            .setCustomId("prev")
            .setLabel("이전 스케줄")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const next = new ButtonBuilder()
            .setCustomId("next")
            .setLabel("다음 스케줄")
            .setStyle(ButtonStyle.Primary);

        const buttonRow = new ActionRowBuilder().addComponents(prev, next);

        const response = await interaction.editReply({
            embeds: schedEmbed.embeds,
            files: schedEmbed.files,
            components: [menuRow, buttonRow],
        });

        const filter = (i) => i.user.id === interaction.user.id;
        // 응답 가능 시간 : 10분 (time: ms) => 10 * 60 * 1000
        const collector = response.createMessageComponentCollector({
            filter,
            time: 600_000,
        });

        const schedIdList = schedTimeList.map((schedTime) =>
            parseInt(schedTime.id),
        );
        const schedIdMap = Object.fromEntries(
            schedIdList.map((id, i) => [
                id,
                { prev: schedIdList[i - 1], next: schedIdList[i + 1] },
            ]),
        );

        let selectedId = schedNow.id;

        collector.on("collect", async (i) => {
            menuRow.components.forEach((menu) => menu.setDisabled(true));
            buttonRow.components.forEach((btn) => btn.setDisabled(true));
            i.update({ components: [menuRow, buttonRow] });

            selectedId =
                i.customId === "scheduleTime"
                    ? parseInt(i.values[0])
                    : selectedId;
            selectedId =
                i.customId === "prev"
                    ? schedIdMap[selectedId].prev
                    : selectedId;
            selectedId =
                i.customId === "next"
                    ? schedIdMap[selectedId].next
                    : selectedId;

            const selectedSched = schedHandler.getScheduleById(
                schedules,
                selectedId,
            );
            const editEmbed = await embedBuilder(selectedSched);

            menuRow.components.forEach((menu) => menu.setDisabled(false));
            buttonRow.components[0].setDisabled(
                schedIdMap[selectedId].prev === undefined,
            );
            buttonRow.components[1].setDisabled(
                schedIdMap[selectedId].next === undefined,
            );

            await interaction.editReply({
                embeds: editEmbed.embeds,
                files: editEmbed.files,
                components: [menuRow, buttonRow],
            });
        });
        collector.on("end", () => {
            interaction.editReply({
                content: "스케줄 선택 가능 시간이 만료되었습니다.",
            });
        });
    },
    async infoReply(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const botInfoEmbed = await embedInfoBuilder();
        await interaction.editReply(botInfoEmbed);
    },
};
