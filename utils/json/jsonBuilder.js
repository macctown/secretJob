var logger = require('../log/logger.js');

var builder = module.exports;

builder.buildResponse = function buildResponse(apiName, isSuccessfully, result, error) {

	var resMessageHeader = {
		"apiVersion": "1.0.0"
	};

	var resStatus;
	if(isSuccessfully){
		resStatus = {
			statusCode: "SUCCESS",
			statusDescription: apiName + " " + "successfully.",
            errors: error==null ? "" : error
        }
		logger.info('[SERVER] '+ apiName +' Successfully');
	}
	else{
		resStatus = {
			statusCode: "FAILED",
			statusDescription: apiName + " " + "failed.",
			errors:error==null ? "" : error
		}
		logger.error('[SERVER] '+ apiName +' Failed');
	}


	var res = {
		messageHeader: resMessageHeader,
		status: resStatus,
		result: result == null ? "" : result
	}

	return res;
}
