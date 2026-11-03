import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor-3BH2MQld.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var askTutor_createServerFn_handler = createServerRpc({
	id: "b99351ca32adaf5a4842a4fdae5ab3daf431533c06ae1f653f6bcbca9bb45a74",
	name: "askTutor",
	filename: "src/lib/ege/tutor.ts"
}, (opts) => askTutor.__executeServer(opts));
var askTutor = createServerFn({ method: "POST" }).validator((input) => input).handler(askTutor_createServerFn_handler, async ({ data }) => {
	const { answerQuestion } = await import("./tutor.server-B3MiHgGt.mjs");
	return answerQuestion(data);
});
//#endregion
export { askTutor_createServerFn_handler };
