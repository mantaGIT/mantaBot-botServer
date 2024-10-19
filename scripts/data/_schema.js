module.exports = {
    /**
     * PVP 매치 스케줄 객체
     * @param {number} id 스케줄 데이터 ID
     * @param {string} mode 게임 모드 (레귤러, 챌린지, 오픈, X매치)
     * @param {string} startTime 스케줄 시작 시간
     * @param {string} endTime 스케줄 끝 시간
     * @param {string} rule 세부 룰 ID
     * @param {string[]} stages 스테이지 ID 배열(2)
     * @returns
     */
    MatchSchedule: (id, mode, startTime, endTime, rule, stages) => {
        return {
            id: id,
            mode: mode,
            startTime: startTime,
            endTime: endTime,
            rule: rule,
            stages: stages,
        };
    },
    /**
     * 연어런 스케줄 객체
     * @param {number} id 스케줄 데이터 ID
     * @param {string} mode 게임 모드
     * @param {string} submode 서브 모드 (일반 / 빅런)
     * @param {string} startTime 스케줄 시작 시간
     * @param {string} endTime 스케줄 끝 시간
     * @param {string} stage 스테이지 ID
     * @param {string} boss 두목 연어 ID
     * @param {string[]} weapons 편성 무기 ID 배열(4)
     * @returns
     */
    SalmonSchedule: (
        id,
        mode,
        submode,
        startTime,
        endTime,
        stage,
        boss,
        weapons,
    ) => {
        return {
            id: id,
            mode: mode,
            submode: submode,
            startTime: startTime,
            endTime: endTime,
            stage: stage,
            boss: boss,
            weapons: weapons,
        };
    },
    /**
     * API 데이터 파싱을 위한 맵핑 객체
     */
    ApiDataMap: {
        regular: {
            group: "regularSchedules",
            subgroups: [],
            setting: "regularMatchSetting",
            settingMode: undefined,
        },
        challenge: {
            group: "bankaraSchedules",
            subgroups: [],
            setting: "bankaraMatchSettings",
            settingMode: "CHALLENGE",
        },
        open: {
            group: "bankaraSchedules",
            subgroups: [],
            setting: "bankaraMatchSettings",
            settingMode: "OPEN",
        },
        x: {
            group: "xSchedules",
            subgroups: [],
            setting: "xMatchSetting",
            settingMode: undefined,
        },
        salmon: {
            group: "coopGroupingSchedule",
            subgroups: ["regularSchedules", "bigRunSchedules"],
            setting: "setting",
            settingMode: undefined,
        },
    },
};
