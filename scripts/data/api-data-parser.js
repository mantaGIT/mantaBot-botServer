// API 호출로 가져온 데이터로부터 원하는 정보만 추출
const _ = require("lodash");
const { MatchSchedule, SalmonSchedule, ApiDataMap } = require("./_schema.js");

module.exports = {
    /**
     * API 데이터로부터 PVP 매치 스케줄을 파싱한다.
     */
    parseMatchData(apiData, mode) {
        const apiDataMap = ApiDataMap[mode];
        const nodes = _.get(apiData, `data.${apiDataMap.group}.nodes`);

        const data = nodes
            .map((node) => {
                const setting =
                    apiDataMap.settingMode === undefined
                        ? _.get(node, apiDataMap.setting)
                        : _.find(_.get(node, apiDataMap.setting), {
                              bankaraMode: `${apiDataMap.settingMode}`,
                          });
                return MatchSchedule(
                    new Date(node.startTime).getTime(),
                    mode,
                    node.startTime,
                    node.endTime,
                    _.get(setting, "vsRule.id"),
                    _.map(_.get(setting, "vsStages"), "id"),
                );
            })
            .sort((a, b) => a.id - b.id);
        return data;
    },
    /**
     * API 데이터로부터 연어런 스케줄을 파싱한다.
     */
    parseSalmonData(apiData, mode) {
        const apiDataMap = ApiDataMap[mode];

        let data = [];
        // subgroup : regularSchedules, bigRunSchedules
        for (const subgroup of apiDataMap.subgroups) {
            const nodes = _.get(
                apiData,
                `data.${apiDataMap.group}.${subgroup}.nodes`,
            );
            if (nodes.length === 0) break;

            const salmonSchedules = nodes.map((node) => {
                const setting = _.get(node, apiDataMap.setting);
                return SalmonSchedule(
                    new Date(node.startTime).getTime(),
                    mode,
                    subgroup,
                    node.startTime,
                    node.endTime,
                    _.get(setting, "coopStage.id"),
                    _.get(setting, "boss.id"),
                    _.map(_.get(setting, "weapons"), "__splatoon3ink_id"),
                );
            });
            data = [...data, ...salmonSchedules];
        }
        data = data.sort((a, b) => a.id - b.id);
        return data;
    },
};
