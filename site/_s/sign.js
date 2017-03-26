function _Date() {
	var now = new Date();
	return now.toGMTString();
}

function _Authorization(date) {
        if ( sdcUser ) {
	    return 'Signature keyId="/' + sdcAccount+ '/users/' + sdcUser + '/keys/' + keyId + '",algorithm="rsa-sha256" ' + doSign(date, RSAPrivateKey);
        } else {
	    return 'Signature keyId="/' + sdcAccount + '/keys/' + keyId + '",algorithm="rsa-sha256" ' + doSign(date, RSAPrivateKey);
        }
}

function _Version() {
	return '~7.0';
}

function _header(xhr) {
	var _x_date = _Date();
	xhr.setRequestHeader("Authorization", _Authorization(_x_date));
	xhr.setRequestHeader("Api-Version", _Version());
	xhr.setRequestHeader("Request-Date", _x_date);
}

function doSign(date, rsa_key) {
	var rsa = new RSAKey();
	rsa.readPrivateKeyFromPEMString(rsa_key); //rsapem.js
	return hex2b64(rsa.signStringWithSHA256(date));
}

function readFilePrivate(e, callback) {
	var file = e.target.files[0];
	if (!file) {
		return;
	}
	var reader = new FileReader();
	reader.onload = function(e) {
		var contents = e.target.result;
		fillInRSAPrivate(contents);
	};
	reader.readAsText(file);
}

function fillInRSAPrivate(contents) {
	$("#RSAPrivateKey").prop('readonly', true);
	$("#RSAPrivateKey").val(contents);
	$('#RSAPrivateKey').fadeIn(300);
}

function readFilePublic(e, callback) {
	var file = e.target.files[0];
	if (!file) {
		return;
	}
	var reader = new FileReader();
	reader.onload = function(e) {
		var contents = e.target.result;
		fillInRSAPublic(contents);
	};
	reader.readAsText(file);
}

function fillInRSAPublic(contents) {
	$('#readPublic').val(contents);
	$('#readPublic').fadeIn(300);
	var keyArray = contents.split(' ');
	var hash = hex_md5(base64_decode(keyArray[1]));
	var hashArray = hash.match(/.{2}/g);
	$("#RSAKeyId").val(hashArray.join(':'));
	$('#RSAKeyId').fadeIn(300);
}

function base64_decode(s) {
	//if (typeof atob === 'function') {
	//	return atob(s);
	//}else{
		return decodeBase64(s);
	//}
}

function noFileInput() {
	$('.noFileInput').fadeOut(300);
	$('#privateKeyFile').fadeOut(300);
	$('#publicKeyFile').fadeOut(300);
	$('.noFileReader').fadeIn(300);
	$('.hexMD5').fadeOut(300);
	$('#readPublic').fadeOut(300);
	$('#RSAPrivateKey').fadeIn(300);
	$('#RSAKeyId').fadeIn(300);
	$("#RSAPrivateKey").prop('readonly', false);
}
