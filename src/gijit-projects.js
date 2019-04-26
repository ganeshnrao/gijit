const Promise = require("bluebird");
const getApi = require("./getApi");
const { execute } = require("./utils");
const { getLineTable } = require("./renderer");

async function main() {
  const api = await getApi();
  const projects = await api.listProjects();
  await Promise.map(
    projects,
    async project => {
      const args = [0, 50, undefined, undefined, project.key];
      const { values } = await api.getAllBoards(...args);
      project.boards = values;
    },
    { concurrency: 6 }
  );
  const fields = ["key", "name", "id", "project/boards"];
  console.log(getLineTable(projects, fields).toString());
}

execute(main);
