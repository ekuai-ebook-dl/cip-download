let config = {
	file: "",//文件名，为空则使用hash
	progressInterval: 500,
};//在此修改配置
let throttleRun = true;
let $throttle = (callback, time) => {
	if (throttleRun) {
		throttleRun = false;
		callback();
		setTimeout(function() {
			throttleRun = true;
		}, time);
	}
};
let $ajax = (byteRange, callback) => {
	let xhr = new XMLHttpRequest();
	xhr.responseType = "blob";
	xhr.onload = function () {
		if (this.status === 200 || this.status === 206) {
			let maxByte = this.getResponseHeader("Accept-Ranges");
			callback(maxByte, this.response);
		} else {
			console.error("加载数据错误", byteRange, this.status);
		}
	};
	xhr.onprogress = function (e) {
		$throttle(() => {
			if (e.lengthComputable) {
				console.log("下载文件", e.loaded, "/", e.total, Math.round(e.loaded / e.total * 10000) / 100);
			} else {
				console.warn("文件长度读取错误");
			}
		}, config.progressInterval);
	};
	xhr.open("GET", url);
	xhr.setRequestHeader("Range", "bytes=" + byteRange);
	xhr.send();
};
let hash = document.getElementsByName("doi")[0].value;
let url = `http://www.cipread.com/reader/viewer.ashx?id=${hash}&typ=1`;
$ajax("0-8192", (range) => {
	console.log("获取文件大小成功", range);
	$ajax(range, (l, blob) => {
		console.log("文件下载成功，正在保存到本地");
		let url = window.URL.createObjectURL(blob);
		let save_link = document.createElement("a");
		save_link.href = url;
		save_link.download = (config.file ? config.file : hash) + ".pdf";
		save_link.click();
	});
});
