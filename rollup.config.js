import strip from "rollup-plugin-strip";

export default {
	input: "source/CrossTabTalk.js",
	plugins: [
		strip(
		{
			functions: ["console.*", "assert.*", "debug", "alert"],
			debugger: false,
			sourceMap: false
		})
	],
	output: [
		{
			format: "umd",
			name: "CTalk",
			file: "build/crosstabtalk.js",
			indent: "\t"
		},
		{
			format: "es",
			file: "build/crosstabtalk.module.js",
			indent: "\t"
		}
	]
};
