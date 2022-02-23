// ======================== GET BROWSER ======================= //
// Get browser (credit to Nimesh and other users of StackOverflow)

function getBrowser() {
  if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf("OPR")) != -1) {
    return "Opera";
  } else if (navigator.userAgent.indexOf("Chrome") != -1) {
    return "Chrome";
  } else if (navigator.userAgent.indexOf("Safari") != -1) {
    return "Safari";
  } else if (navigator.userAgent.indexOf("Firefox") != -1) {
    return "Firefox";
  } else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) {
    // If IE > 10
    return "IE";
  } else {
    return "Unknown";
  }
}

// ======================== GET AMAZON MTURK WORKER ID ======================= //
// Get inferred subject ID from URL (credit to Eyal Peer)

function getSubjectID() {
  var paramstr = window.location.search.substring(1);
  var parampairs = paramstr.split("&");
  for (i in parampairs) {
    var pair = parampairs[i].split("=");
    if (pair[0] == "workerId") {
      return pair[1];
    }
  }
}

// ======================== ENDPAGE ======================= //

function showEndPage() {
  $("#debrief").show()
  $("#instructions").hide()
  $("#endButton").attr("onclick", "postData()");
  $("#endButton").html("Submit");
}

// ======================== POST DATA TO SERVER ======================= //

function redirect(){
    window.location = "https://jhu.sona-systems.com/webstudy_credit.aspx?experiment_id=464&credit_token=ed20e675d74f4a3fb8ad8c1decbd8009&survey_code="+window.subjectID
}
function postData() {
  // update final participant stats in last trial of response
  $("#debrief,#endButton").hide()
  $("#topDisplay,#feedbackBox,#endButton,#feedback").hide();
  feedback = $("#feedbackBox").val();
  endTime = new Date();
  window.frame[window.frame.length - 1].feedback = feedback;
  window.frame[window.frame.length - 1].endTime = endTime;
  // Collect responses into JSON / csv file
  var dataString = JSON.stringify(window.frame);
  // post response to server
  $.post("logTrial.py", {
    subjectID: window.subjectID,
    dataString: dataString,
  }).done(function(){alert("Thank you! You will be redirected to the SONA website.");redirect()});
  $("#instructions").show();
  $("#instructions").text("Please don't close yet!");
  //$("#instructions").text("Thank you — please copy and enter the following code into the HIT: ADI29JF39");
}
