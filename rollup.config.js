import strip from "rollup-plugin-strip";

export default {
	input: "source/CrossTabTalk.js",
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
