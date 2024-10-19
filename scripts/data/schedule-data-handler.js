// const _ = require("lodash");
const fs = require("node:fs");
const path = require("node:path");

const { GAMEMODE } = require("../../configs/gamemode.json");
const { parseMatchData, parseSalmonData } = require("./api-data-parser.js");

// eslint-disable-next-line no-undef
const mainPath = path.dirname(path.dirname(__dirname));

module.exports = {
    /**
     * 스케줄 객체 파일을 생성한다.
     */
    createSchedulesFile(apiData, gamemode) {
        const data =
            gamemode.mode === GAMEMODE.SALMON.mode
                ? parseSalmonData(apiData, gamemode.mode)
                : parseMatchData(apiData, gamemode.mode);

        const dataFilePath = path.join(
            mainPath,
            `resources/data/schedules/${gamemode.mode}.json`,
        );
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    },
    /**
     * 파일을 읽어 스케줄 객체를 가져온다.
     */
    loadSchedules(gamemode) {
        const scheduleFilePath = path.join(
            mainPath,
            `resources/data/schedules/${gamemode.mode}.json`,
        );

        try {
            const schedulesFile = fs.readFileSync(scheduleFilePath);
            const schedules = JSON.parse(schedulesFile);
            return schedules;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    },
    /**
     * 현재 스케줄 객체를 반환한다.
     */
    getScheduleNow(schedules) {
        const timeNow = Date.now();
        const scheduleNow = schedules.find(
            (schedule) =>
                timeNow >= new Date(schedule.startTime) &&
                timeNow < new Date(schedule.endTime),
        );
        return scheduleNow;
    },
    /**
     * 해당 ID를 갖는 스케줄 객체를 반환한다.
     */
    getScheduleById(schedules, id) {
        return schedules.find((schedule) => schedule.id === id);
    },
};
