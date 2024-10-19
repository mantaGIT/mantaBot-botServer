const fs = require("node:fs");
const path = require("node:path");
// eslint-disable-next-line no-undef
const mainPath = path.dirname(path.dirname(__dirname));

const schedule = require("node-schedule");

const { GAMEMODE } = require("../../configs/gamemode.json");
const schedHandler = require("./schedule-data-handler.js");

module.exports = {
    /**
     * API 호출 모듈을 원하는 시간마다 동작하도록 스케줄링한다.
     */
    createFetchApiTimer(schedURL, langURL) {
        // 첫 실행 시 한 번 호출
        console.log("Init api data files.");
        fetchScheduleData(schedURL);
        fetchLanguageData(langURL);

        console.log("Register api-fetch timer.");
        // 한국 시 기준 홀수 시 정각 30초(ex. 09:00:30)마다 API 데이터 가져온다
        const rule = new schedule.RecurrenceRule();
        rule.hour = Array.from({ length: 24 })
            .map((x, i) => i)
            .filter((x) => x % 2 === 0);
        rule.minute = 0;
        rule.second = 30;
        rule.tz = "Etc/UTC";
        schedule.scheduleJob(rule, () => {
            fetchScheduleData(schedURL);
            fetchLanguageData(langURL);
        });
    },
};

/**
 * 스케줄 데이터 요청하고 처리한다.
 */
function fetchScheduleData(url) {
    fetch(url)
        .then((response) => response.json())
        .then((apiData) => {
            // update match schedules
            schedHandler.createSchedulesFile(apiData, GAMEMODE.REGULAR);
            schedHandler.createSchedulesFile(apiData, GAMEMODE.CHALLENGE);
            schedHandler.createSchedulesFile(apiData, GAMEMODE.OPEN);
            schedHandler.createSchedulesFile(apiData, GAMEMODE.X);
            // update salmon run schedules
            schedHandler.createSchedulesFile(apiData, GAMEMODE.SALMON);
            console.log(`Update schedule data files by gamemode from ${url}.`);
        })
        .catch((error) => {
            console.error(error);
        });
}
/**
 * 한글 패치 데이터 요청하고 처리한다.
 */
function fetchLanguageData(url) {
    fetch(url)
        .then((response) => response.json())
        .then((apiData) => {
            // update language mapping file (ko-KR.json)
            fs.writeFileSync(
                path.join(mainPath, "configs/ko-KR.json"),
                JSON.stringify(apiData, null, 2),
            );
            console.log(`Update ko-KR data files from ${url}.`);
        })
        .catch((error) => {
            console.error(error);
        });
}
