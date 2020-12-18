/*
To use this script:

1) first include jQuery in your html <head> (this is from a CDN so you do not have to keep a local copy)

	<script src="https://code.jquery.com/jquery-3.4.1.min.js"
        integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
        crossorigin="anonymous"></script>

2) then include the accompanying utilities.js document in the html <head>

	<script src="js/utilities.js"></script>

3) then add this file:

	<script src="js/KLect.js"></script>

4) now you can add any jsPsych files you require

5) define the following variables at the top of the <script> tag in which you write your experiment (obviously set
their values to those appropriate for your context):

	let lab = 'klein';
	let researcher = 'jono';
	let experiment = 'posner_cueing_paradigm';
	let email = 'this.impetu@gmail.com';
	let path = '~/klein';  // this is the only variable that you don't choose; for now, this is the correct value

5) finally, the on-finish callback of your jsPsych experiment must be a call to KLect.send(), with 5 variables populated:

jsPsych.init({
	timeline: <your timeline object>,
	show_progress_bar: false,
	on_finish: function() {
		KLect.send(lab, researcher, experiment, email, path) }
});

 */

let KLect = {};
KLect.send = function (lab, researcher, experiment, email, path) {
    KLect.email = email;
    KLect.path = "../../../KLect/KLect.php";
    /* generates a unique identifier for each participant's file so prevent overwrite; extracting the participant
       id from their data to name the file is more trouble than it's worth, but that data is still IN the file /*
     */
    let participant = KLect.uuid();
    jsPsych.data.addProperties({participant: participant});

    // this ads a post-experiment message container to the browser that will contain the success/fail message from the server
    $('body').append(
        $("<div />").attr('id', 'KLect-Modal').css({
            'min-height': '75%',
            width: '75%',
            'box-shadow': '5px 5px 5px rgba(0,0,0,.4)',
            'background-color': 'rgba(0,0,0,.2)',
            'z-index': 999999,
            position: 'absolute',
            top: '8%',
            left: '12.5%',
            display: 'none'
        }).append(
            $("<div />").attr('id', 'KLect-message').css({
                position: 'relative',
                width: 'inherit',
                height: 'inherit',
                padding: "50px",
                'margin-left': 'auto',
                'margin-right': 'auto',
                'line-height': '32pt',
                'font-size': '24pt',
                color: 'rbg(45,45,48)',
                'text-align': 'center'
            })
        )
    );

    // here we actually send the data
    $.ajax({
        type: 'POST',
        url: KLect.path,
        data: {data: jsPsych.data.get().json(), experiment: experiment, researcher: researcher, lab: lab, participant: participant},
        success: function (data) {
            // server will reply "success" if files are written; if so, we tell the participant thanks and good-bye
            if (data == 'success') {
                $("#KLect-message").text('Success! The data for this experiment has been received by the server and you may safely exit.');
            } else {
                pr(data, "ServerResp");
                KLect.fail()
            }
        },
        fail: function(data) {
            pr(data, "ServerResp");
            KLect.fail();
        }
    })
};

KLect.uuid = function (){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c == 'x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
};

KLect.fail = function() {
    /* if anything but the word "success" is returned by the server, we assume a failure; so we instead
       print the participant's data to the screen and ask the participant to email it to the researcher */
    let fail_txt = `Uh oh, something has gone wrong delivering your data to the server. Please copy everything below and send it to the following e-mail address:<br /> <a href='mailto: ${KLect.email}'>${KLect.email}</a>:`;
    $("#KLect-message").append(
        $("<div />").append([
            $("<p />").html(fail_txt),
            $("<pre />").css({
                'width': 'inherit',
                'font-size': '10px',
                'white-space': 'pre-wrap',
                'white-space': '-moz-pre-wrap',
                'white-space': '-pre-wrap',
                'white-space': '-o-pre-wrap',
                'word-wrap': 'break-word',
                'line-height': '12px'
            }).text(jsPsych.data.get().csv())
        ]));

    $("#KLect-Modal").css('display', 'block')
};