
export default {
	input: "source/TabTalk.js",
	plugins: [],
	// sourceMap: true,
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