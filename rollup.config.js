import strip from "rollup-plugin-strip";

export default {
	input: "source/TabTalk.js",
	plugins: [
		strip(
		{
			debugger: true,
			functions: ["console.*", "assert.*", "debug", "alert"],
			sourceMap: false
		})
	],
	output: [
		{
			format: "umd",
			name: "TabTalk",
			file: "build/tabtalk.js",
			indent: "\t"
		},
		{
			format: "es",
			file: "build/tabtalk.module.js",
			indent: "\t"
		}
	]
};
