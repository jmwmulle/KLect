<?php
	$dev = array_merge(array("fs" => '1', "dva" => '1', "one_dva" => 50, "st" => 96, "at" => 96, "demo" => '1', "axis" => 'none', 'practice' => '1', 'mute' => '0', 'instrux' => '1'), $_GET);
	$one_dva = 50;

	// all this stuff is written for the dev to speed up testing; 'gethostname' is a ridiculous bit of logic that
	// is used because the production server was using an older version of php that didn't include this function,
	// allowing Jon to hack together a simple way to detect whether this was run on the local dev machine or on prod
	$pre_path = function_exists("gethostname") ? "../.." : "../..";
	$exp_trial_cfg = ['b' => 14, 'r' => 2, 'c_l' => 7, 't_l' => 2, 't' => 2];
	if (function_exists("gethostname")) {
		$exp_trial_cfg = ['b' => 14, 'r' => 1, 'c_l' => 2, 't_l' => 1, 't' => 2];
	}
?>
<html>
<head>
    <title>Spatial ACS</title>
    <meta charset="UTF-8">
    <script
            src="https://code.jquery.com/jquery-3.4.1.min.js"
            integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
            crossorigin="anonymous"></script>
    <link rel="shortcut icon" type="image/png" href="<?= $pre_path; ?>/lib/klein.favicon.png">
    <script src="<?= $pre_path; ?>/lib/utilities.js"></script>
    <script src="<?= $pre_path; ?>/lib/jspsych.js"></script>
    <script src="<?= $pre_path; ?>/lib/KLect.js"></script>
    <script src="<?= $pre_path; ?>/lib/jspsych-audio-keyboard-response.js"></script>
    <script src="<?= $pre_path; ?>/lib/jspsych-html-keyboard-response.js"></script>
    <script src="<?= $pre_path; ?>/lib/jspsych-fullscreen.js"></script>
    <script src="<?= $pre_path; ?>/lib/DVA_Manager.js"></script>
    <link href="css/jspsych.css" rel="stylesheet" type="text/css"/>
    <link href="css/spatial_acs.css" rel="stylesheet" type="text/css"/>
    <script src="js/spatial_acs.js"></script>
</head>
<body>
<script>
    // function demonstration(page) {
    //     return `<div id="wrapper">` +
    //         `<div id="right" class="box ${page === 1 ? 'demo eight-to-two' : 'eight'}">` +
    //             `<div class="digit upper"></div>` +
    //             `<div class="digit lower"></div>` +
    //         `</div>` +
    //         `<div id="bottom" class="box eight">` +
    //             `<div class="digit upper"></div>` +
    //             `<div class="digit lower"></div>` +
    //         `</div>` +
    //         `<div id="center" class="box ${page === 1 ? 'demo zero-to-eight' : 'eight'}">` +
    //             `<div class="digit upper"></div>` +
    //             `<div class="digit lower"></div>` +
    //         `</div>` +
    //         `<div id="left" class="box eight">` +
    //             `<div class="digit upper"></div>` +
    //             `<div class="digit lower"></div>` +
    //         `</div>` +
    //         `<div id="top" class="box eight">` +
    //             `<div class="digit upper"></div>` +
    //             `<div class="digit lower"></div>` +
    //         `</div>` +
    //     `</div>`;
    // }
	let dva_mgr = new DVAManager();
	dva_mgr.one_dva = <?=$one_dva;?>;
	dva_mgr.display_element = "#spatial_acs_dva_frame";
	let data = [];
	let timeline = [];
	let axis = '<?=strtolower($dev['axis'])?>';
	if (axis === 'none') {
		$('body').append(
			$('<p />').html('No axis was specified in the provided URL. If you are a participant in this experiment' +
				'please contact your researcher. If you are a researcher, please ensure the following is ' +
				'appended to your URL: ?axis=x or  ?axis=y.'
			)
		);
	}
	//to prevent
	// just some configuration for accelerating testing
	let build = {
		instructions: <?=$dev['instrux'] === '1' ? 'true' : 'false';?>,
		practicing: <?=$dev['practice'] === '1' ? 'true' : 'false';?>,
		mute: <?=$dev['mute'] === '1' ? 'true' : 'false';?>,
		demographics: <?=$dev['demo'] === '1' ? 'true' : 'false';?>,
		full_screen: <?=$dev['fs'] === '1' ? 'true' : 'false';?>,
		dva_mgr: <?=$dev['dva'] === '1' ? 'true' : 'false';?>
	};

	let axis_desc = axis === 'x' ? 'top or bottom' : 'left or right';
	let instructions = {
		p1: "<div class='instructions'>" +
			"<p>Welcome to the experiment. Please concentrate and do your best.</p>" +
			"<p>In this experiment, you will be asked to report whether a target digit is a 2 or 5.</p>" +
			"</div>",
		p2: "<div class='instructions'>" +
			"<p>Throughout the experiment, please try your best to fixate on the center of the screen.</p>" +
			"<p>Rest breaks will be provided throughout, during which you may move your eyes freely.</p>" +
			"</div>",
		p3: "<div class='instructions'>" +
			"<p>Trials will begin with four figure 8s arranged up/down/left/right.</p>" +
			"<p>Soon after, another will appear at the center.</p>" +
			"</div>",
		p4: "<div class='instructions'>" +
			"<p>Later, a tone will be played, and one of the 8's might flash briefly.</p>" +
			"<p>Importantly, which 8 flashes is entirely uninformative as to where the target might appear.</p>" +
			"</div>",
		p5: "<div class='instructions'>" +
			`<p>Shortly after this happens, either the ${axis_desc}  8 will turn into a 2 or a 5.</p>` +
			"<p>IWhen this happens please indicate, as quickly and as accurately as possible, which number it became by pressing '2' or '5' on the number pad.</p>" +
			`<p><em>Note:</em> Since your target will only ever appear at ${axis_desc} you should try to attend to these locations throughout the task.</p>` +
			"</div>",

		completion: "Congratulations, you have successfully completed this study. Thank you for participating!"
	};


	if (build.full_screen) {
		timeline.push({
			type: 'fullscreen',
			fullscreen_mode: true
		});
	}

	// now we iteratively factor trials
	let trials = [];

	// this bit exists to accelerate testing and is otherwise unnecessary
	let iter_cfg = {
		p_b: build.practicing ? 1 : 0,
		b: <?=$exp_trial_cfg['b'];?>,       // blocks
		r: <?=$exp_trial_cfg['r'];?>,       // reps, default = 2
		c_l: <?=$exp_trial_cfg['c_l'];?>,   // cue locations,  default = 7
		t_l: <?=$exp_trial_cfg['t_l'];?>,   // target locations,  default = 2
		t: <?=$exp_trial_cfg['t'];?>        // target types,  default = 2
	};

	function trials_per_block() {
		return iter_cfg.r * iter_cfg.c_l * iter_cfg.t_l * iter_cfg.t;
	}

	for (let b = 0; b < 14; b++) { // number of block repititions (including practice)
		let block = [];
		for (let r = 0; r < iter_cfg.r; r++) { // two full sets of trials per block
			for (let c_l = 0; c_l < iter_cfg.c_l; c_l++) { // cue location
				let cue_location = null;
				switch (c_l) {
					case 1:
						cue_location = "top";
						break;
					case 2:
						cue_location = "bottom";
						break;
					case 3:
						cue_location = "left";
						break;
					case 4:
						cue_location = "right";
						break;
					case 5:
						cue_location = false;
						break;
					default:
						cue_location = false;
						break;
				}
				for (let t_l = 0; t_l < iter_cfg.t_l; t_l++) { // target, 1= top/left 2 = bottom/right, depending on the axis

					let target_location = null;
					if (t_l === 0) {
						target_location = axis === 'y' ? 'top' : 'left';
					} else {
						target_location = axis === 'x' ? 'bottom' : 'right';
					}

					for (let t = 0; t < iter_cfg.t; t++) { // 2 or 5
						let target = t % 2 ? "two" : "five";

						block.push({
							type: 'spatial_acs',
							audio: ["audio/plop.wav"],
							cue_location: cue_location,
							target_location: target_location,
							target: target,
							cfg: {
								one_dva: dva_mgr.one_dva,
								data_repo: data,
								feedback_trial: null,
								data_template: {
									block: build.practicing ? b + 1 : b,
									trial: null,
									rt: null,
									trial_type: build.practicing && b === 0 ? 'normal' : 'practice',
									target_axis: axis,
									cue_location: cue_location,
									cue_duration: 100,
									ctoa: 200,
									target: target,
									target_location: target_location,
									response: null,
									time_out: null
								}
							}
						});
					}
				}
			}
		}
		trials.push(array_shuffle(block));
	}

	// add trial numbers in post-shuffle;
	for (var i = 0; i < iter_cfg.b; i++) {
		if (build.practicing && i === 0) continue;
		for (var j = 0; j < trials_per_block(); j++) {
			trials[i][j].cfg.data_template.trial = (j + 1) + trials_per_block() * (build.practicing ? i : i - 1);
			trials[i][j].cfg.feedback_trial = j + 1 === trials_per_block();
		}
	}

	// adds instructions
	if (build.instructions) {
		for (var i = 5; i > 0; i--) {
			pr(i);
			trials[0].unshift({
				type: "html-keyboard-response",
				stimulus: instructions[`p${i}`]
			});
		}
	}

	let all_trials = [];

	for (let i = 0; i < iter_cfg.b; i++) {
		if (!build.practicing && i === 0) continue;
		all_trials = all_trials.concat(trials[i]);
	}

	all_trials.push({
		type: "html-keyboard-response",
		stimulus: instructions.complete
	});

	var experiment = {
		timeline: all_trials,
		timeline_variables: [],
		repetitions: 1,
		randomize_order: true
	};
	timeline.push(experiment);


	/****                                                      we wrap jsPsych's init call in an anonymous function and
	 *                                                         hand it off to the instance of DVAManager to call when
	 *                                                         it's good and god damned ready, and then call it's init()
	 * */
	dva_mgr.launch = function () {

		/* start the experiment */
		jsPsych.init({
			timeline: timeline,
			show_progress_bar: false,
			on_finish: function () {
				KLect.send('klein', 'brett feltmate', 'spatial_acs', 'the.bretter.email@gmail.com');
			}
		});
	};

	function demographics() {
		if (build.demographics) {
			let years = [$("<option />").attr('value', false).html('')];
			for (let y = 17; y <= 80; y++) years.push($("<option />").attr('value', y).html(y));

			$("body").append(
				$("<div />").attr('id', 'demographics').append([
					$("<form />").append([
						$("<div />").addClass('input-wrapper').append([
							$("<label />").html("What is your full name, banner number or e-mail address? <br />Your answer will be encrypted and cannot be read later."),
							$("<input />").attr({'type': 'text', 'id': 'banner'})
						]),
						$("<div />").addClass('input-wrapper').append([
							$("<label />").html("What is your age in years?"),
							$("<select />").attr('id', 'age').append(years)
						]),
						$("<div />").addClass('input-wrapper').append([
							$("<label />").html("What is your gender?"),
							$("<select />").attr('id', 'sex').append([
								$("<option />").attr('value', false).html(''),
								$("<option />").attr('value', 'non-binary').html('non-binary'),
								$("<option />").attr('value', 'male').html('male'),
								$("<option />").attr('value', 'female').html('female')
							])
						]),
						$("<div />").addClass('input-wrapper').append([
							$("<label />").html("What best describes your handedness? Please select the best option."),
							$("<select />").attr('id', 'handedness').append([
								$("<option />").attr('value', false).html(''),
								$("<option />").attr('value', 'right').html('Right-handed'),
								$("<option />").attr('value', 'left').html('Left-handed'),
								$("<option />").attr('value', 'ambidextrous').html('Ambidextrous')
							])
						]),
						$("<div />").attr('id', 'demographics-warning').addClass('hidden').html('Please complete each question before submitting.'),
						$("<div />").attr('id', 'demographics-submit').html('submit')
					])
				])
			);

			$("body").on('click', "#demographics-submit", function () {
				let valid = [$("#banner").val().length >= 6];
				$("select").each(function () {
					valid.push($(this).val() != "false")
				});
				if (!all(valid, true)) {
					$("#demographics-warning").removeClass('hidden');
					return;
				}
				$("#demographics-warning").removeClass('hidden').addClass('hidden)');
				let demos = {};
				demos.trial_type = $("#banner").val();
				demos.choice_file = $("#age").val();
				demos.choice_index = $("#sex").val();
				demos.left_label_0 = $("#handedness").val();
				data.push(demos);
				$("#demographics").remove();
				$("#demographics-styling").remove();
				dva_mgr.init(!build.dva_mgr);

			})
		} else {
			dva_mgr.init(!build.dva_mgr, true);
		}
	}


	demographics();


</script>
</body>
</html>