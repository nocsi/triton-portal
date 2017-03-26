var endpoint;
var keyId;
var keyName;
var RSAPrivateKey;
var loginHandle;
var sdcAccount;
var sdcUser;
var localStorageSupported = false;
var fileReaderSupported = false;

var images = [];
var packages = [];
var networks = [];

function intensify() {
	$('.keyId').hide();
	$('.loginName').hide();
	$('.logout').hide();
	$('.localFound').hide();
	$('.removeLocal').hide();
	$('.newOptions').hide();
	$('#readPublic').hide();
	if (typeof(Storage) !== "undefined") {
		localStorageSupported = true;
	}
	if (typeof(FileReader) !== "undefined") {
		fileReaderSupported = true;
	}
	if (fileReaderSupported === true) {
		$('#RSAPrivateKey').hide();
		$('#privateKeyFile').show();
		$('#privateKeyFile').on('change', readFilePrivate);
		
		$('#RSAKeyId').hide();
		$('#publicKeyFile').show();
		$('#publicKeyFile').on('change', readFilePublic);
		$('.noFileReader').hide();
		
	}else{
		$('#privateKeyFile').hide();
		$('#publicKeyFile').hide();
		$('.hexMD5').hide();
		$('#readPublic').hide();
		$('.noFileReader').show();
	}
	if (localStorageSupported === true) {
		if (localStorage.getItem("keyId") !== null) {
			$('.informationButton').hide();
			$('.localFound').fadeIn(300);
			$('.removeLocal').fadeIn(300);
			$('.localFound').append(': ' + localStorage.getItem("loginHandle"));
		}
	} else {
		$('.localStorage').hide();
	}
	hideLoader();
}

function hideLoader() {
	$('.loading').fadeOut(300);
	//$('.main').fadeIn(200);
}

function showLoader() {
	$('.loading').fadeIn(300);
	//$('.main').fadeOut(200);
}

function showNginxConfig() {
	var w = window.open();
	$(w.document.body).html('<pre>' + nginxConfig.join("\n") + '</pre>');
}

function _ajaxError(er) {
	hideLoader();
	if (er.responseJSON.message !== undefined) {
		alert('Error: ' + er.responseJSON.message);
	}else{
		alert("Ajax error, please try again.");
		console.log(er);
	}
}

function register() {
	endpoint = $("#cloudAPIProxy").val();
	keyId = $("#RSAKeyId").val();
	sdcAccount = $("#sdcAccount").val();
	sdcUser = $("#sdcUser").val();
        (sdcUser) ? loginHandle = sdcAccount + '/' + sdcUser : loginHandle = sdcAccount;
        //(sdcUser) ? loginHandle = sdcUser : loginHandle = sdcAccount;
	RSAPrivateKey = $("#RSAPrivateKey").val();
	if ($("#save2local").prop('checked') && localStorageSupported === true) {
		localStorage['endpoint'] = endpoint;
		localStorage['keyId'] = keyId;
		localStorage['loginHandle'] = loginHandle;
		localStorage['sdcAccount'] = sdcAccount;
		localStorage['sdcUser'] = sdcUser;
		localStorage['RSAPrivateKey'] = RSAPrivateKey;
	}
	testConnection();
}

function registerFromLocal() {
	endpoint = localStorage['endpoint'];
	keyId = localStorage['keyId'];
	loginHandle = localStorage['loginHandle'];
	sdcAccount = localStorage['sdcAccount'];
	sdcUser = localStorage['sdcUser'];
	RSAPrivateKey = localStorage['RSAPrivateKey'];
	testConnection();
}

function removeLocal(reload) {
	if (localStorageSupported === true) {
		localStorage.removeItem('endpoint');
		localStorage.removeItem('keyId');
		localStorage.removeItem('loginHandle');
		localStorage.removeItem('sdcAccount');
		localStorage.removeItem('sdcUser');
		localStorage.removeItem('RSAPrivateKey');
	}
	if (reload) location.reload();
}

function testConnection() {
	showLoader();
        var urlcat;
        (sdcUser) ? urlcat =  endpoint + '/' + sdcAccount + '/users/' + sdcUser + '/keys' : urlcat = endpoint + '/' + sdcAccount + '/keys';
	$.ajax({
		type: "GET",
        	url: urlcat,
        	//url: endpoint + '/' + loginHandle + '/keys',
		contentType: "application/json",
		dataType: 'json',
		beforeSend: _header,
		success: function(data) {
			for (key in data) {
				if (data[key]['fingerprint'] === keyId) {
					keyName = data[key]['name'];
				}
			}
			$('.information').modal('hide');
			$('.keyId').html(keyName + ' (' + keyId + ')');
			$('.loginName').html(loginHandle);
			$('.keyId').fadeIn(300);
			$('.loginName').fadeIn(300);
			$('.logout').fadeIn(300);
			//displayDash();
			$('.ii').fadeOut(300);
			cache();
		},
		error: function(e) {
			if (typeof(e.responseJSON.message) === "string") {
				alert(e.responseJSON.message);
			}
			hideLoader();
		}
	});
}

function displayDash() {
	if (typeof(keyName) !== 'string') {
		return;
	}
	var _html = [];
	_html.push('<h2 class="page-header">Dashboard?</h2>');
	_html.push('<div class="panel panel-default">');
	_html.push('<div class="panel-heading">');
	_html.push('<h3 class="panel-title">Statistics</h3>');
	_html.push('</div>');
	_html.push('<div class="panel-body">');

	_html.push('<p>Under constructrion</p>');

	_html.push('</div></div>');

	$('.main').html(_html.join("\n"));
}

function type2Name(type) {
	if (type == 'smartmachine') {
		return 'SmartMachine';
	} else if (type == 'virtualmachine') {
		return 'KVM';
	} else {
		return type;
	}
}

function listMachines(callback) {
	if (typeof(keyName) !== 'string') {
		return;
	}
	showLoader();
	$.ajax({
		type: "GET",
		url: endpoint + '/' + sdcAccount + '/machines',
		contentType: "application/json",
		dataType: 'json',
		beforeSend: _header,
		success: callback,
		error: _ajaxError
	});
}

function displayMachines() {
	listMachines(function(response, status, xhr) {
		var _html = [];
		_html.push('<h2 class="page-header">Virtual Machines</h2>');
		_html.push('<p class="lead"><span class="glyphicon glyphicon-repeat" aria-hidden="true" onclick="displayMachines()"></span></p>');
		_html.push('<div class="panel panel-default">');
		_html.push('<div class="panel-body">');
		_html.push('<div class="table-responsive">');
		_html.push('<table class="table table-striped">');
		_html.push('<thead>');
		_html.push('<tr>');
		_html.push('<td>Name</td>');
		_html.push('<td>Type</td>');
		_html.push('<td>Memory</td>');
		_html.push('<td>Disk</td>');
		_html.push('<td>Image</td>');
		_html.push('<td>Package</td>');
		_html.push('<td>Firewall</td>');
		_html.push('<td>State</td>');
		_html.push('<td>Action</td>');
		_html.push('</tr>');
		_html.push('</thead><tbody>');

		for (key in response) {
			_html.push('<tr>');
			//_html.push('<td>' + response[key]['id'] + '</td>');
			_html.push('<td><a href="#" onclick="displayMachine(\'' + response[key]['id'] + '\')">' + response[key]['name'] + '</a></td>');
			_html.push('<td>' + type2Name(response[key]['type']) + '</td>');
			_html.push('<td>' + response[key]['memory'] + ' MB</td>');
			_html.push('<td>' + response[key]['disk'] / 1024 + ' GB</td>');
			_html.push('<td><a href="#" onclick="displayImage(\'' + response[key]['image'] + '\')">' + imageUUID2Name(response[key]['image']) + '</a></td>');
			_html.push('<td><a href="#" onclick="displayPackage(\'' + response[key]['package'] + '\')">' + response[key]['package'] + '</a></td>');
			_html.push('<td>' + (response[key]['firewall_enabled'] === true ? 'Enabled' : 'Disabled') + '</td>');
			_html.push('<td>' + response[key]['state'] + '</td>');
			if (response[key]['state'] === 'stopped') {
				_html.push('<td class="classAction"><span class="glyphicon glyphicon-play" aria-hidden="true" onclick="startMachine(\'' + response[key]['state'] + '\', \'' + response[key]['id'] + '\', displayMachines)"></span></td>');
			}else if (response[key]['state'] === 'running') {
				_html.push('<td class="classAction">');
				_html.push('<span class="glyphicon glyphicon-repeat" aria-hidden="true" onclick="rebootMachine(\'' + response[key]['state'] + '\', \'' + response[key]['id'] + '\', displayMachines)"></span>&nbsp;');
				_html.push('&nbsp;<span class="glyphicon glyphicon-stop" aria-hidden="true" onclick="stopMachine(\'' + response[key]['state'] + '\', \'' + response[key]['id'] + '\', displayMachines)"></span>');
				_html.push('</td>');
			}else{
				_html.push('<td class="classAction"></td>');
			}
			_html.push('</tr>');
		}

		_html.push('</tbody></table>');
		_html.push('</div>');
		_html.push('</div></div>');
		$('.main').html(_html.join("\n"));
		hideLoader();
	});
}

function cache() {
	listImages(function(response, status, xhr) {
		images = response;
		listPackages(function(_response, status, xhr) {
			packages = _response;
			listNetworks(function(__response, status, xhr) {
				displayMachines();
				networks = __response;
				$('.newOptions').fadeIn(300);
			});
		});
	});
}

function imageUUID2Network(uuid) {
	if (networks.length < 1) {
		return '-';
	}
	for (index = 0; index < networks.length; ++index) {
		if (networks[index]['id'] == uuid) {
			return networks[index]['name'];
		}
	}
	return '-';
}

function imageUUID2Name(uuid) {
	if (images.length < 1) {
		return '-';
	}
	for (index = 0; index < images.length; ++index) {
		if (images[index]['id'] == uuid) {
			return images[index]['name'];
		}
	}
	return '-';
}

function listImages(callback) {
	if (typeof(keyName) !== 'string') {
		return;
	}
	showLoader();
	$.ajax({
		type: "GET",
		url: endpoint + '/' + sdcAccount + '/images?state=all',
		contentType: "application/json",
		dataType: 'json',
		beforeSend: _header,
		success: callback,
		error: _ajaxError
	});
}

function displayImages() {
	listImages(function(response, status, xhr) {
		var _html = [];
		_html.push('<h2 class="page-header">Images</h2>');
		_html.push('<div class="panel panel-default">');
		_html.push('<div class="panel-body">');
		_html.push('<div class="table-responsive">');
		_html.push('<table class="table table-striped">');
		_html.push('<thead>');
		_html.push('<tr>');
		//_html.push('<td>UUID</td>');
		_html.push('<td>Name</td>');
		_html.push('<td>Version</td>');
		_html.push('<td>Type</td>');
		_html.push('<td>OS</td>');
		_html.push('<td>State</td>');
		_html.push('</tr>');
		_html.push('</thead><tbody>');

		for (key in response) {
			_html.push('<tr>');
			//_html.push('<td>' + response[key]['id'] + '</td>');
			_html.push('<td><a href="#" onclick="displayImage(\'' + response[key]['id'] + '\')">' + response[key]['name'] + '</a></td>');
			_html.push('<td>' + response[key]['version'] + '</td>');
			_html.push('<td>' + type2Name(response[key]['type']) + '</td>');
			_html.push('<td>' + response[key]['os'] + '</td>');
			_html.push('<td>' + response[key]['state'] + '</td>');
			_html.push('<td></td>');
			_html.push('</tr>');
		}

		_html.push('</tbody></table>');
		_html.push('</div>');
		_html.push('</div></div>');
		$('.main').html(_html.join("\n"));
		hideLoader();
	});
}

function getMachine(uuid, callback) {
	if (typeof(keyName) !== 'string') {
		return;
	}
	showLoader();
	$.ajax({
		type: "GET",
		url: endpoint + '/' + sdcAccount + '/machines/' + uuid,
		contentType: "application/json",
		dataType: 'json',
		beforeSend: _header,
		success: callback,
		error: _ajaxError
	});
}

function getMachineNICs(uuid, callback) {
	if (typeof(keyName) !== 'string') {
		return;
	}
	showLoader();
	$.ajax({
		type: "GET",
		url: endpoint + '/' + sdcAccount + '/machines/' + uuid + '/nics',
		contentType: "application/json",
		dataType: 'json',
		beforeSend: _header,
		success: callback,
		error: _ajaxError
	});
}

function displayMachine(uuid) {
	getMachine(uuid, function(response, status, xhr) {
		getMachineNICs(uuid, function(_response, status, xhr) {
			var _html = [];
			_html.push('<h2 class="page-header">Machine "' + response['name'] + '"</h2>');
			_html.push('<p class="lead"><span class="glyphicon glyphicon-repeat" aria-hidden="true" onclick="displayMachine(\'' + uuid + '\')"></span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-info-sign" aria-hidden="true" onclick="displayMachineAudit(\'' + response['name'] + '\', \'' + uuid + '\')"></span></p>');
			_html.push('<div class="panel panel-default">');
			_html.push('<div class="panel-heading">');
			_html.push('<h3 class="panel-title">Overview</h3>');
			_html.push('</div>');
			_html.push('<div class="panel-body">');
			
			_html.push('<form class="form-horizontal">');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Name</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + response['name'] + '</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">UUID</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + response['id'] + '</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Compute Node</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + response['compute_node'] + '</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Creation Time</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + new Date(response['created']).toString() + '</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Last Updated</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + new Date(response['updated']).toString() + '</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Type</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + type2Name(response['type']) + '</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Memory</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + response['memory'] + ' MB</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Disk</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + response['disk']/1024 + ' GB</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Image</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static"><a href="#" onclick="displayImage(\'' + response['image'] + '\')">' + imageUUID2Name(response['image']) + '</a></p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Package</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static"><a href="#" onclick="displayPackage(\'' + response['package'] + '\')">' + response['package'] + '</a></p>');
			_html.push('</div>');
			_html.push('</div>');
			
			/*var _networks = [];
			for (key in response['networks']) {
				_networks.push(imageUUID2Network(response['networks'][key]));
			}
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Network(s)</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + _networks.join(", ") + '</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">IP Address(es)</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + response['ips'].join(", ") + '</p>');
			_html.push('</div>');
			_html.push('</div>');*/
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Firewall</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + (response['firewall_enabled'] === true ? 'Enabled' : 'Disabled') + '</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">State</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + response['state'] + '</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('</form>');

			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="panel panel-default">');
			_html.push('<div class="panel-heading">');
			_html.push('<h3 class="panel-title">NICs</h3>');
			_html.push('</div>');
			_html.push('<div class="panel-body">');

			_html.push('<div class="table-responsive">');
			_html.push('<table class="table table-striped">');
			_html.push('<thead>');
			_html.push('<tr>');
			_html.push('<td>IP</td>');
			_html.push('<td>Netmask</td>');
			_html.push('<td>Gateway</td>');
			_html.push('<td>MAC Address</td>');
			_html.push('<td>Primary</td>');
			_html.push('<td>State</td>');
			_html.push('</tr>');
			_html.push('</thead><tbody>');

			for (key in _response) {
				_html.push('<tr>');
				_html.push('<td>' + _response[key]['ip'] + '</td>');
				_html.push('<td>' + _response[key]['netmask'] + '</td>');
				_html.push('<td>' + (typeof(_response[key]['gateway']) !== 'undefined' ?  _response[key]['gateway'] : '-') + '</td>');
				_html.push('<td>' + _response[key]['mac'] + '</td>');
				_html.push('<td>' + (_response[key]['primary'] === true ? 'Yes': 'No') + '</td>');
				_html.push('<td>' + _response[key]['state'] + '</td>');
				_html.push('</tr>');
			}

			_html.push('</tbody></table>');
			
			_html.push('</div>');

			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="panel panel-default">');
			_html.push('<div class="panel-heading">');
			_html.push('<h3 class="panel-title">Power</h3>');
			_html.push('</div>');
			_html.push('<div class="panel-body classAction">');

			_html.push('<div class="col-sm-6">');
			if (response['state'] === 'stopped') {
				_html.push('<button type="button" class="btn btn-success" onclick="startMachine(\'' + response['state'] + '\', \'' + response['id'] + '\')">Start</button>');
			}else if (response['state'] === 'running') {
				_html.push('<button type="button" class="btn btn-warning" onclick="rebootMachine(\'' + response['state'] + '\', \'' + response['id'] + '\')">Reboot</button>');
				_html.push('<button type="button" class="btn btn-danger" onclick="stopMachine(\'' + response['state'] + '\', \'' + response['id'] + '\')">Stop</button>');

			}
			_html.push('</div>');

			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="panel panel-default">');
			_html.push('<div class="panel-heading">');
			_html.push('<h3 class="panel-title">Modifications</h3>');
			_html.push('</div>');
			_html.push('<div class="panel-body classAction">');

			_html.push('<div class="col-sm-6">');
			if (response['type'] === 'smartmachine') {
				_html.push('<button type="button" class="btn btn-primary" onclick="displayResizeMachine(\'' + response['id'] + '\')">Resize</button>');
			}else {
				_html.push('<p>KVM virtual machine does not support resizing.</p>');
			}
			
			_html.push('</div>');
			_html.push('<div class="col-sm-6">');
			_html.push('<button type="button" class="btn btn-primary" onclick="displayRenameMachine(\'' + response['id'] + '\')">Rename</button>');
			_html.push('</div>');

			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="panel panel-default">');
			_html.push('<div class="panel-heading">');
			_html.push('<h3 class="panel-title">Nuke Zone</h3>');
			_html.push('</div>');
			_html.push('<div class="panel-body classAction">');

			_html.push('<div class="col-sm-6">');
			if (response['state'] === 'stopped') {
				_html.push('<button type="button" class="btn btn-danger" onclick="deleteMachine(\'' + response['id'] + '\')">Delete</button>');
			}else{
				_html.push('<p>The machine needs to be in "stopped" state before the nuke.</p>');
			}
			_html.push('</div>');

			_html.push('</div>');
			_html.push('</div>');

			$('.main').html(_html.join("\n"));
			hideLoader();
		});
	});
}


function getImage(uuid, callback) {
	if (typeof(keyName) !== 'string') {
		return;
	}
	showLoader();
	$.ajax({
		type: "GET",
		url: endpoint + '/' + sdcAccount + '/images/' + uuid,
		contentType: "application/json",
		dataType: 'json',
		beforeSend: _header,
		success: callback,
		error: _ajaxError
	});
}

function displayImage(uuid) {
	getImage(uuid, function(response, status, xhr) {
		var _html = [];
		_html.push('<h2 class="page-header">Image "' + response['name'] + '" (' + response['version'] + ')</h2>');
		_html.push('<p class="lead">' + response['description'] + '</p>');
		_html.push('<div class="panel panel-default">');
		_html.push('<div class="panel-heading">');
		_html.push('<h3 class="panel-title">Overview</h3>');
		_html.push('</div>');
		_html.push('<div class="panel-body">');
		
		_html.push('<form class="form-horizontal">');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">UUID</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + response['id'] + '</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">Owner</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + response['owner'] + '</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">Type</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + type2Name(response['type']) + '</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">Operating System</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + response['os'] + '</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">Published Date</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + new Date(response['published_at']).toString() + '</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">State</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + response['state'] + '</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('</form>');

		_html.push('</div></div>');

		$('.main').html(_html.join("\n"));
		hideLoader();
	});
}

function listKeys(callback) {
	if (typeof(keyName) !== 'string') {
		return;
	}
	showLoader();
        var urlcat;
        (sdcUser) ? urlcat =  endpoint + '/' + sdcAccount + '/users/' + sdcUser + '/keys' : urlcat = endpoint + '/' + sdcAccount + '/keys';
	$.ajax({
		type: "GET",
                //url: endpoint + '/' + loginHandle + '/keys',
                url: urlcat,
		contentType: "application/json",
		dataType: 'json',
		beforeSend: _header,
		success: callback,
		error: _ajaxError
	});
}

function displayKeys() {
	listKeys(function(response, status, xhr) {
		var _html = [];
		_html.push('<h2 class="page-header">SSH Keys</h2>');
		_html.push('<p class="lead">Note: You won\'t be able to delete the key used to login.</p>');
		_html.push('<div class="panel panel-default">');
		_html.push('<div class="panel-body">');
		_html.push('<div class="table-responsive">');
		_html.push('<table class="table table-striped">');
		_html.push('<thead>');
		_html.push('<tr>');
		_html.push('<td>Name</td>');
		_html.push('<td>Fingerprint</td>');
		_html.push('<td>Public Key</td>');
		_html.push('<td>Action</td>');
		_html.push('</tr>');
		_html.push('</thead><tbody>');

		for (key in response) {
			_html.push('<tr>');
			_html.push('<td>' + response[key]['name'] + '</td>');
			_html.push('<td>' + response[key]['fingerprint'] + '</td>');
			_html.push('<td>' + response[key]['key'].substring(0, 40) + '...</td>');
			if (response[key]['fingerprint'] === keyId) {
				_html.push('<td>-</td>');
			}else{
				_html.push('<td class="classAction">');
				_html.push('<span class="glyphicon glyphicon-remove" aria-hidden="true" onclick="confirmRemoveKey(\'' + response[key]['name'] + '\')"></span>');
				_html.push('</td>');
			}
			_html.push('</tr>');
		}

		_html.push('</tbody></table>');
		_html.push('</div>');
		_html.push('</div></div>');
		$('.main').html(_html.join("\n"));
		hideLoader();
	});
}

function confirmRemoveKey(name) {
	warningConfirm('Confirm to delete this public key?', function() {
                var urlcat;
                (sdcUser) ? urlcat =  endpoint + '/' + sdcAccount + '/users/' + sdcUser + '/keys/' + name : urlcat = endpoint + '/' + sdcAccount + '/keys/' + name;
		$.ajax({
			type: 'DELETE',
                        //url: endpoint + '/' + loginHandle + '/keys/' + name,
                        url: urlcat,
			dataType: 'json',
			beforeSend: function(xhr) {
				_header(xhr);
				$('.classAction').html('...');
				showLoader();
			},
			complete: function(e) {
				if (e.status !== 204) {
					if (typeof(e.responseJSON.message) === "string") {
						alert(e.responseJSON.message);
					}
				}
				displayKeys();
			}
		});
	});
}

function displayAddKey() {
	var _html = [];
	_html.push('<h2 class="page-header">Upload an SSH Key</h2>');
	_html.push('<div class="panel panel-default">');
	_html.push('<div class="panel-body">');
		
	_html.push('<form class="form-horizontal keyForm">');
		
	_html.push('<div class="form-group">');
	_html.push('<label class="col-sm-3 control-label">Name</label>');
	_html.push('<div class="col-sm-6">');
	_html.push('<input type="text" class="form-control nameToUse" placeholder="My SSH Key">');
	_html.push('</div>');
	_html.push('</div>');
			
	_html.push('<div class="form-group">');
	_html.push('<label class="col-sm-3 control-label">SSH Key</label>');
	_html.push('<div class="col-sm-6">');
	_html.push('<textarea class="form-control" rows="5" id="keyToUpload"></textarea>');
	
	_html.push('</div>');
	_html.push('</div>');
	
	_html.push('<div class="form-group">');
	_html.push('<label class="col-sm-3 control-label">Fingerprint</label>');
	_html.push('<div class="col-sm-6">');
	_html.push('<p class="form-control-static" id="keyFingerprint"></p>');
	
	_html.push('</div>');
	_html.push('</div>');
	
	_html.push('<script type="text/javascript">');
	_html.push('$("#keyToUpload").blur(function() {');;
	_html.push('var keyArray = $(this).val().split(" ");');
	_html.push('if (typeof(keyArray[1]) !== "string") {return;}');
	_html.push('var hash = hex_md5(base64_decode(keyArray[1]));');
	_html.push('var hashArray = hash.match(/.{2}/g);');
	_html.push('$("#keyFingerprint").html(hashArray.join(":"));');
	_html.push('});');
	_html.push('</script>');
	
	_html.push('<div class="form-group">');
	_html.push('<label class="col-sm-3 control-label"></label>');
	_html.push('<div class="col-sm-3">');
	_html.push('<button type="button" class="btn btn-success createButton" onclick="uploadKey()">Save</button>');
	_html.push('</div>');
	_html.push('</div>');
			
	_html.push('</form>');
			
	$('.main').html(_html.join("\n"));
}

function uploadKey() {
        var urlcat;
        (sdcUser) ? urlcat =  endpoint + '/' + sdcAccount + '/users/' + sdcUser + '/keys' : urlcat = endpoint + '/' + sdcAccount + '/keys';
	$.ajax({
		type: "POST",
                url: urlcat,
		contentType: "application/json",
		dataType: 'json',
		data: JSON.stringify({
			"name": $('.nameToUse').val(),
			"key": $('#keyToUpload').val()
		}),
		beforeSend: _header,
		complete: function(d) {
			if (d.status !== 201) {
				if (typeof(d.responseJSON.message) === "string") {
					alert(d.responseJSON.message);
				}
				displayAddKey();
			}else{
				displayKeys();
			}
		}
	});
}

function packageUUID2Name(uuid) {
	if (packages.length < 1) {
		return '-';
	}
	for (index = 0; index < packages.length; ++index) {
		if (packages[index]['id'] == uuid) {
			return packages[index]['name'];
		}
	}
	return '-';
}

function listPackages(callback) {
	if (typeof(keyName) !== 'string') {
		return;
	}
	showLoader();
	$.ajax({
		type: "GET",
		url: endpoint + '/' + sdcAccount + '/packages',
		contentType: "application/json",
		dataType: 'json',
		beforeSend: _header,
		success: callback,
		error: _ajaxError
	});
}

function displayPackages() {
	listPackages(function(response, status, xhr) {
		var _html = [];
		_html.push('<h2 class="page-header">Packages</h2>');
		_html.push('<div class="panel panel-default">');
		_html.push('<div class="panel-body">');
		_html.push('<div class="table-responsive">');
		_html.push('<table class="table table-striped">');
		_html.push('<thead>');
		_html.push('<tr>');
		_html.push('<td>Name</td>');
		_html.push('<td>Version</td>');
		_html.push('<td>Memory</td>');
		_html.push('<td>Swap</td>');
		_html.push('<td>Disk</td>');
		_html.push('<td>vCPUs</td>');
		_html.push('<td>Max. Lightweight Processes</td>');
		_html.push('</tr>');
		_html.push('</thead><tbody>');

		for (key in response) {
			_html.push('<tr>');
			_html.push('<td><a href="#" onclick="displayPackage(\'' + response[key]['name'] + '\')">' + response[key]['name'] + '</a></td>');
			_html.push('<td>' + response[key]['version'] + '</td>');
			_html.push('<td>' + response[key]['memory'] + ' MB</td>');
			_html.push('<td>' + response[key]['swap'] + ' MB</td>');
			_html.push('<td>' + response[key]['disk']/1024 + ' GB</td>');
			_html.push('<td>' + response[key]['vcpus'] + '</td>');
			_html.push('<td>' + response[key]['lwps'] + '</td>');
			_html.push('</tr>');
		}

		_html.push('</tbody></table>');
		_html.push('</div>');
		_html.push('</div></div>');
		$('.main').html(_html.join("\n"));
		hideLoader();
	});
}

function getPackage(uuid, callback) {
	if (typeof(keyName) !== 'string') {
		return;
	}
	showLoader();
	$.ajax({
		type: "GET",
		url: endpoint + '/' + sdcAccount + '/packages/' + uuid,
		contentType: "application/json",
		dataType: 'json',
		beforeSend: _header,
		success: callback,
		error: _ajaxError
	});
}

function displayPackage(uuid) {
	getPackage(uuid, function(response, status, xhr) {
		var _html = [];
		_html.push('<h2 class="page-header">Package "' + response['name'] + '" (' + response['version'] + ')</h2>');
		_html.push('<p class="lead">' + response['description'] + '</p>');
		_html.push('<div class="panel panel-default">');
		_html.push('<div class="panel-heading">');
		_html.push('<h3 class="panel-title">Memory & CPU</h3>');
		_html.push('</div>');
		_html.push('<div class="panel-body">');

		_html.push('<form class="form-horizontal">');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">Memory</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + response['memory'] + '</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">Swap</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + response['swap'] + '</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">vCPUs</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + response['vcpus'] + '</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		/*_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">CPU Caps</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">(Not yet implemented)</p>');
		_html.push('</div>');
		_html.push('</div>');*/
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">Max. Lightweight Processes</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + response['lwps'] + '</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('</form>');

		_html.push('</div></div>');
		
		_html.push('<div class="panel panel-default">');
		_html.push('<div class="panel-heading">');
		_html.push('<h3 class="panel-title">Storage</h3>');
		_html.push('</div>');
		_html.push('<div class="panel-body">');

		_html.push('<form class="form-horizontal">');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">Disk Quota</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + response['disk']/1024 + ' GB</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('</form>');

		_html.push('</div></div>');

		$('.main').html(_html.join("\n"));
		hideLoader();
	});
}

function warningConfirm(msg, callback) {
	BootstrapDialog.confirm({
		title: 'WARNING',
		message: msg,
		type: BootstrapDialog.TYPE_WARNING,
		closable: true, // <-- Default value is false
		draggable: true, // <-- Default value is false
		btnCancelLabel: 'No', // <-- Default value is 'Cancel',
		btnOKLabel: 'Confirm', // <-- Default value is 'OK',
		btnOKClass: 'btn-warning', // <-- If you didn't specify it, dialog type will be used,
		callback: function(result) {
			if(result) {
				callback();
			}
		}
	});
}

var orig_state;

function actionMachine(action, current, uuid, _cb) {
	if (typeof(keyName) !== 'string') {
		return;
	}
	$.ajax({
		type: action === 'delete' ? 'DELETE' : 'POST',
		url: endpoint + '/' + sdcAccount + '/machines/' + uuid + (action === 'delete' ? '' : '?action=' + action),
		dataType: 'json',
		beforeSend: function(xhr) {
			_header(xhr);
			orig_state = current;
			$('.classAction').html('...');
			showLoader();
		},
		complete: function(e) {
			if (e.status === 202) {
				(function worker() {
					$.ajax({
						type: "GET",
						url: endpoint + '/' + sdcAccount + '/machines/' + uuid,
						contentType: "application/json",
						dataType: 'json',
						beforeSend: _header,
						success: function(data) {
							if (data['state'] !== orig_state && data['state'] !== 'stopping' && data['state'] !== 'ready') {
								orig_state = '';
								if (typeof(_cb) !== 'function') {
									displayMachine(uuid);
								}else{
									_cb();
								}
							}else{
								setTimeout(worker, 5000);
							}
						}
					});
				})();
			}else{
				alert('Error.');
				displayMachine(uuid);
			}
		}
	});
}

function startMachine(current, uuid, callback) {
	actionMachine('start', current, uuid, callback);	
}

function rebootMachine(current, uuid, callback) {
	warningConfirm('Confirm to reboot your virtual machine?', function() {
		actionMachine('reboot', 'stopped', uuid, callback);
	})
}

function stopMachine(current, uuid, callback) {
	warningConfirm('Confirm to stop your virtual machine?', function() {
		actionMachine('stop', current, uuid, callback);
	})
}

function deleteMachine(uuid) {
	warningConfirm('Confirm to delete your virtual machine?', function() {
		warningConfirm('Please confirm again that you want to delete your virtual machine.', function() {
			//Disable in development
			//actionMachine('delete', 'stopped', uuid, displayMachines);
		})
	})
}

function displayResizeMachine(uuid) {
	getMachine(uuid, function(response, status, xhr) {
		getPackage(response['package'], function(_response, status, xhr) {
			var _html = [];
			_html.push('<h2 class="page-header">Resizing Machine "' + response['name'] + '"</h2>');
			_html.push('<p class="lead"><span class="glyphicon glyphicon-backward" aria-hidden="true" onclick="displayMachine(\'' + uuid + '\')"></span></p>');
			_html.push('<div class="panel panel-default">');
			_html.push('<div class="panel-body">');
		
			_html.push('<form class="form-horizontal resizeForm">');
		
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">UUID</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + response['id'] + '</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Memory</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + _response['memory'] + ' MB</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Swap</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + _response['swap'] + ' MB</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Disk</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + _response['disk']/1024 + ' GB</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">vCPUs</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + _response['vcpus'] + ' </p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Max. Lightweight Processes</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + _response['lwps'] + ' </p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">Current Package</label>');
			_html.push('<div class="col-sm-9">');
			_html.push('<p class="form-control-static">' + response['package'] + '</p>');
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('<div class="form-group">');
			_html.push('<label class="col-sm-3 control-label">New Package</label>');
			_html.push('<div class="col-sm-3">');
			_html.push('<select class="form-control" onchange="displayNewPackage(\'' + response['id'] + '\', this)">');
			_html.push('<option value="-"></option>');
			for (key in packages) {
				if (_response['id'] !== packages[key]['id']) {
					_html.push('<option value="' + packages[key]['id'] + '">' + packages[key]['name'] + '</option>');
				}
			}
			_html.push('</select>');
			
			_html.push('</div>');
			_html.push('</div>');
			
			_html.push('</form>');
			
			$('.main').html(_html.join("\n"));
			hideLoader();
		});
	});
}

function displayNewPackage(uuid, sel) {
	if (sel.value === '-') return;
	$('.newPackageInfo').remove();
	getPackage(sel.value, function(_response, status, xhr) {
		var _html = [];
		_html.push('<div class="newPackageInfo">');
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">New Memory</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + _response['memory'] + ' MB</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">New Swap</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + _response['swap'] + ' MB</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">New Disk</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + _response['disk']/1024 + ' GB</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">New vCPUs</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + _response['vcpus'] + ' </p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">New Max. Lightweight Processes</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + _response['lwps'] + ' </p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label"></label>');
		_html.push('<div class="col-sm-3">');
		_html.push('<button type="button" class="btn btn-success resizeButton" onclick="resizeMachine(\'' + _response['name'] + '\', \'' + uuid + '\', \''+ _response['id'] + '\')">Resize</button>');
		_html.push('</div>');
		_html.push('</div>');
		
		
		_html.push('</div>');

		$('.resizeForm').append(_html.join("\n"));
		hideLoader();
	});
}

var new_pkg;

function resizeMachine(newPkgName, uuid, newPkgUUID) {
	if (typeof(keyName) !== 'string') {
		return;
	}
	$.ajax({
		type: 'POST',
		url: endpoint + '/' + sdcAccount + '/machines/' + uuid,
		dataType: 'json',
		data: {
			'action': 'resize',
			'package': newPkgUUID
		},
		beforeSend: function(xhr) {
			_header(xhr);
			$('.resizeButton').prop('disabled', true);
			new_pkg = newPkgName;
			showLoader();
		},
		complete: function(e) {
			if (e.status === 202) {
				(function worker() {
					$.ajax({
						type: "GET",
						url: endpoint + '/' + sdcAccount + '/machines/' + uuid,
						contentType: "application/json",
						dataType: 'json',
						beforeSend: _header,
						success: function(data) {
							if (data['package'] === new_pkg) {
								new_pkg = '';
								displayMachine(uuid);
							}else{
								setTimeout(worker, 5000);
							}
						}
					});
				})();
			}else{
				alert('Error.');
				displayResizeMachine(uuid);
			}
		}
	});
}

function displayRenameMachine(uuid) {
	getMachine(uuid, function(response, status, xhr) {
		var _html = [];
		_html.push('<script type="text/javascript">$("#newName").on("input", function() { if(/^[a-zA-Z0-9\-]+$/.test($("#newName").val())) {$(".renameButton").prop("disabled", false);}else{$(".renameButton").prop("disabled", true);}});</script>');
		_html.push('<h2 class="page-header">Renaming Machine "' + response['name'] + '"</h2>');
		_html.push('<p class="lead"><span class="glyphicon glyphicon-backward" aria-hidden="true" onclick="displayMachine(\'' + uuid + '\')"></span></p>');
		_html.push('<div class="panel panel-default">');
		_html.push('<div class="panel-body">');
	
		_html.push('<form class="form-horizontal renameForm">');
	
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">New Name</label>');
		_html.push('<div class="col-sm-3">');
		_html.push('<input type="text" class="form-control" id="newName" placeholder="My-VM">');
		_html.push('</div>');
		_html.push('<div class="col-sm-6">');
		_html.push('<p class="form-control-static">Only letters, numbers, and hyphens are allowed.</p>');
		_html.push('</div>');
		_html.push('</div>');
			
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label"></label>');
		_html.push('<div class="col-sm-3">');
		_html.push('<button type="button" class="btn btn-success renameButton" onclick="renameMachine(\'' + response['name'] + '\', \'' + uuid + '\')" disabled>Rename</button>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('</form>');
		
		$('.main').html(_html.join("\n"));
		hideLoader();
	});
}

var new_Name;

function renameMachine(newName, uuid) {
	if (typeof(keyName) !== 'string') {
		return;
	}
	$.ajax({
		type: 'POST',
		url: endpoint + '/' + sdcAccount + '/machines/' + uuid,
		dataType: 'json',
		data: {
			'action': 'rename',
			'name': $('#newName').val()
		},
		beforeSend: function(xhr) {
			_header(xhr);
			new_Name = $('#newName').val();
			$('.renameButton').prop('disabled', true);
			showLoader();
		},
		complete: function(e) {
			if (e.status === 202) {
				(function worker() {
					$.ajax({
						type: "GET",
						url: endpoint + '/' + sdcAccount + '/machines/' + uuid,
						contentType: "application/json",
						dataType: 'json',
						beforeSend: _header,
						success: function(data) {
							if (data['name'] === new_Name) {
								new_Name = '';
								displayMachine(uuid);
							}else{
								setTimeout(worker, 5000);
							}
						}
					});
				})();
			}else{
				alert('Error.');
				displayRenameMachine(uuid);
			}
		}
	});
}

function getMachineAudit(uuid, callback) {
	if (typeof(keyName) !== 'string') {
		return;
	}
	showLoader();
	$.ajax({
		type: "GET",
		url: endpoint + '/' + sdcAccount + '/machines/' + uuid + '/audit',
		contentType: "application/json",
		dataType: 'json',
		beforeSend: _header,
		success: callback,
		error: _ajaxError
	});
}

function displayMachineAudit(name, uuid) {
	getMachineAudit(uuid, function(response, status, xhr) {
		var _html = [];
		_html.push('<h2 class="page-header">Machine Audit for "' + name + '"</h2>');
		_html.push('<p class="lead"><span class="glyphicon glyphicon-backward" aria-hidden="true" onclick="displayMachine(\'' + uuid + '\')"></span></p>');
		_html.push('<div class="panel panel-default">');
		_html.push('<div class="panel-body">');
		_html.push('<div class="table-responsive">');
		_html.push('<table class="table table-striped">');
		_html.push('<thead>');
		_html.push('<tr>');
		_html.push('<td>Time</td>');
		_html.push('<td>Action</td>');
		_html.push('<td>Success</td>');
		_html.push('<td>Caller</td>');
		_html.push('</tr>');
		_html.push('</thead><tbody>');

		for (key in response) {
			_html.push('<tr>');
			_html.push('<td>' + new Date(response[key]['time']).toString() + '</td>');
			_html.push('<td>' + response[key]['action'] + '</td>');
			_html.push('<td>' + response[key]['success'] + '</td>');
			_html.push('<td>' + response[key]['caller']['type'] + (typeof(response[key]['caller']['keyId']) === 'string' ? ': ' + response[key]['caller']['keyId'] : '') + '</td>');
		}

		_html.push('</tbody></table>');
		_html.push('</div>');
		_html.push('</div></div>');
		
		$('.main').html(_html.join("\n"));
		hideLoader();
	});
}

function listNetworks(callback) {
	if (typeof(keyName) !== 'string') {
		return;
	}
	showLoader();
	$.ajax({
		type: "GET",
		url: endpoint + '/' + sdcAccount + '/networks',
		contentType: "application/json",
		dataType: 'json',
		beforeSend: _header,
		success: callback,
		error: _ajaxError
	});
}

function displayNetworks() {
	listNetworks(function(response, status, xhr) {
		var _html = [];
		_html.push('<h2 class="page-header">Networks</h2>');
		_html.push('<div class="panel panel-default">');
		_html.push('<div class="panel-body">');
		_html.push('<div class="table-responsive">');
		_html.push('<table class="table table-striped">');
		_html.push('<thead>');
		_html.push('<tr>');
		//_html.push('<td>UUID</td>');
		_html.push('<td>Name</td>');
		_html.push('<td>Public</td>');
		_html.push('</tr>');
		_html.push('</thead><tbody>');

		for (key in response) {
			_html.push('<tr>');
			//_html.push('<td>' + response[key]['id'] + '</td>');
			_html.push('<td>' + response[key]['name'] + '</td>');
			_html.push('<td>' + (response[key]['public'] === true ? 'Yes' : 'No') + '</td>');
			_html.push('</tr>');
		}

		_html.push('</tbody></table>');
		_html.push('</div>');
		_html.push('</div></div>');
		$('.main').html(_html.join("\n"));
		hideLoader();
	});
}

function displayImageOnCreate(sel) {
	if (sel.value === '-') return;
	$('.displayImage').html('');
	getImage(sel.value, function(_response, status, xhr) {
		var _html = [];
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">Type</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + type2Name(_response['type']) + '</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">Operating System</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + _response['os'] + '</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		$('.displayImage').html(_html.join("\n"));
		hideLoader();
	});
}

function displayPackageOnCreate(sel) {
	if (sel.value === '-') return;
	$('.displayPackage').html('');
	getPackage(sel.value, function(_response, status, xhr) {
		var _html = [];
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">Memory</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + _response['memory'] + ' MB</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">Swap</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + _response['swap'] + ' MB</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">Disk</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + _response['disk']/1024 + ' GB</p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">vCPUs</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + _response['vcpus'] + ' </p>');
		_html.push('</div>');
		_html.push('</div>');
		
		_html.push('<div class="form-group">');
		_html.push('<label class="col-sm-3 control-label">Max. Lightweight Processes</label>');
		_html.push('<div class="col-sm-9">');
		_html.push('<p class="form-control-static">' + _response['lwps'] + ' </p>');
		_html.push('</div>');
		_html.push('</div>');
		
		$('.displayPackage').html(_html.join("\n"));
		hideLoader();
	});
}

function displayCreateMachine() {
	var _html = [];
	_html.push('<script type="text/javascript">$(".nameToUse").on("input", function() { if(/^[a-zA-Z0-9\-]+$/.test($(".nameToUse").val())) {$(".createButton").prop("disabled", false);}else{$(".createButton").prop("disabled", true);}});</script>');
	_html.push('<h2 class="page-header">Provision a New Machine</h2>');
	_html.push('<p class="lead">(Still in development)</p>');
	_html.push('<div class="panel panel-default">');
	_html.push('<div class="panel-body">');
		
	_html.push('<form class="form-horizontal createForm">');
		
	_html.push('<div class="form-group">');
	_html.push('<label class="col-sm-3 control-label">Name</label>');
	_html.push('<div class="col-sm-3">');
	_html.push('<input type="text" class="form-control nameToUse" placeholder="My-VM">');
	_html.push('</div>');
	_html.push('<div class="col-sm-6">');
	_html.push('<p class="form-control-static">Only letters, numbers, and hyphens are allowed.</p>');
	_html.push('</div>');
	_html.push('</div>');
			
	_html.push('<div class="form-group">');
	_html.push('<label class="col-sm-3 control-label">Image</label>');
	_html.push('<div class="col-sm-3">');
	_html.push('<select class="form-control imageToUse" onchange="displayImageOnCreate(this)">');
	_html.push('<option value="-"></option>');
	for (key in images) {
		_html.push('<option value="' + images[key]['id'] + '">' + images[key]['name'] + ' (' + images[key]['version'] + ')</option>');
	}
	_html.push('</select>');
	
	_html.push('</div>');
	_html.push('</div>');
	
	_html.push('<div class="displayImage"></div>');
	
	_html.push('<div class="form-group">');
	_html.push('<label class="col-sm-3 control-label">Package</label>');
	_html.push('<div class="col-sm-3">');
	_html.push('<select class="form-control packageToUse" onchange="displayPackageOnCreate(this)">');
	_html.push('<option value="-"></option>');
	for (key in packages) {
		_html.push('<option value="' + packages[key]['id'] + '">' + packages[key]['name'] + '</option>');
	}
	_html.push('</select>');
			
	_html.push('</div>');
	_html.push('</div>');
		
	_html.push('<div class="displayPackage"></div>');
	
	_html.push('<div class="form-group">');
	_html.push('<label class="col-sm-3 control-label">Network</label>');
	_html.push('<div class="col-sm-3">');
	_html.push('<select multiple class="form-control networksToUse">');
	for (key in networks) {
		_html.push('<option value="' + networks[key]['id'] + '">' + networks[key]['name'] + '</option>');
	}
	_html.push('</select>');
			
	_html.push('</div>');
	_html.push('</div>');
	
	_html.push('<div class="form-group">');
	_html.push('<label class="col-sm-3 control-label"></label>');
	_html.push('<div class="col-sm-3">');
	_html.push('<button type="button" class="btn btn-success createButton" onclick="createMachine()" disabled>Create</button>');
	_html.push('</div>');
	_html.push('</div>');
			
	_html.push('</form>');
			
	$('.main').html(_html.join("\n"));
}

function createMachine() {
	// Still developing
	return;
	if (typeof(keyName) !== 'string') {
		return;
	}
	$.ajax({
		type: 'POST',
		url: endpoint + '/' + sdcAccount + '/machines',
		dataType: 'json',
		data: {
			'name': $('.nameToUse').val(),
			'package': $('.packageToUse').val(),
			'image': $('.imageToUse').val(),
			'networks': $('.networksToUse').val(),
			'firewall_enabled': false
		},
		beforeSend: function(xhr) {
			_header(xhr);
			$('.createButton').prop('disabled', true);
			showLoader();
		},
		complete: function(e) {
			if (e.status === 201) {
				(function worker() {
					$.ajax({
						type: "GET",
						url: endpoint + '/' + sdcAccount + '/machines/' + uuid,
						contentType: "application/json",
						dataType: 'json',
						beforeSend: _header,
						success: function(data) {
							if (data['state'] !== 'provisioning') {
								displayMachine(uuid);
							}else{
								setTimeout(worker, 5000);
							}
						}
					});
				})();
			}else{
				alert('Error.');
				displayCreateMachine();
			}
		}
	});
}
