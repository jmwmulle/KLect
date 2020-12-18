<?php
	$dev = array_merge(array("fs" => '1', "dva" => '1', "one_dva" => 50, "st" => 96, "at" => 96, "demo"=> '1'), $_GET);
	$pre_path = gethostname() === 'Swastis-iMac.local' ? "../.." : "..";
	//	print_r($dev);
	//	die();
?>

<html>
<head>
    <title>Crossmodal Correspondence</title>
    <script
            src="https://code.jquery.com/jquery-3.4.1.min.js"
            integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
            crossorigin="anonymous"></script>
    <script src="<?= $pre_path; ?>/lib/utilities.js"></script>
    <script src="<?= $pre_path; ?>/lib/jspsych.js"></script>
    <script src="<?= $pre_path; ?>/lib/KLect.js"></script>
    <script src="<?= $pre_path; ?>/lib/jspsych-html-keyboard-response.js"></script>
    <script src="<?= $pre_path; ?>/lib/jspsych-fullscreen.js"></script>
    <script src="js/image-grid-click-response.js"></script>
    <script src="js/multimedia-discrimination-slider.js"></script>
    <script src="<?= $pre_path; ?>/lib/DVA_Manager.js"></script>
    <link href="css/jspsych.css" rel="stylesheet" type="text/css"/>
    <style>
        body {
            background-color: rgba(45, 45, 48, 255);
            font-family: sans-serif;
            color: white
        }
    </style>
    <style id="demographics-styling">
        #demographics {
            width: 800px;
            height: auto;
            padding: 100px 0;
            background-color: white;
            color: #212121;
            margin:100px auto;
            text-align: center;
            border-radius: 16px;
            border: 1px solid black;
        }

        .input-wrapper {
            width: 100%;
            margin-bottom: 2em;
        }
        label {
            display:block;
            /*text-align: left;*/
        }
        .hidden {
            display: none
        }
        #demographics-submit {
            background-color: rgb(45,45,52);
            color: white;
            border-radius: 4px;
            border: 1px solid black;
            width: 50px;
            padding:10px;
            margin:4em auto 0 auto;
        }
        #demographics-warning { color: red;}
        #demographics-submit:hover {

            background-color: rgb(175,175, 190);
        }

        p.note {
            font-weight:100;
            font-size:.75em;
            line-height:1em;
            width: 400px;
            margin: 10px auto 2em auto;
            text-align: left;
        }

        select { width: 150px;}
    </style>
</head>
<body>

<script>

    function all(stack, needle) {
    	for (let i=0; i < stack.length; i++)  {
    		if (stack[i] != needle) return false;
    	}
    	return true;
    }

	/****                                                                               ONLY STUFF LIKE THIS IS DVA-DOCS
	 *                                create a new DVAManager (and make sure you've included the js file in the header);
	 *                                then assign some convenient value to be 1dVA throughout
	 * */
	let data_repo = [];
	let data_template = {
		trial_type: null,
		choice_file: null,
		choice_index: null,
		img: null,
		left_label_0: null,
		left_label_1: null,
		left_label_2: null,
		left_label_3: null,
		left_label_4: null,
		left_label_5: null,
		response_0: null,
		response_1: null,
		response_2: null,
		response_3: null,
		response_4: null,
		response_5: null,
		right_label_0: null,
		right_label_1: null,
		right_label_2: null,
		right_label_3: null,
		right_label_4: null,
		right_label_5: null,
		rt_0: null,
		rt_1: null,
		rt_2: null,
		rt_3: null,
		rt_4: null,
		rt_5: null,
		tone: null,
		grid_sequence: null,
		replay_count: null
	};

	let dva_mgr = new DVAManager();

	dva_mgr.one_dva = <?=$dev['one_dva'];?>;

	let stimuli = {
		image: ["img/Bug_Dist.png", "img/Bug_Familiar.png", "img/Bug_Hollow.png", "img/Bug_Smooth.png", "img/Bug_Symm.png", "img/Bug.png", "img/Curves_Dist.png", "img/Curves_Familiar.png", "img/Curves_Hollow.png", "img/Curves_Smooth.png", "img/Curves_Symm.png", "img/Curves.png", "img/Jagged_Dist.png", "img/Jagged_Familiar.png", "img/Jagged_Hollow.png", "img/Jagged_Smooth.png", "img/Jagged_Symm.png", "img/Jagged.png", "img/Star_Dist.png", "img/Star_Familiar.png", "img/Star_Hollow.png", "img/Star_Smooth.png", "img/Star_Symm.png", "img/Star.png"],
		audio: ["aud/S1_Asym.wav", "aud/S1_Dist.wav", "aud/S1_Harpsicord.wav", "aud/S1_Harsh.wav", "aud/S1_Hollow.wav", "aud/S1_Soft.wav", "aud/S2_Asym.wav", "aud/S2_Dist.wav", "aud/S2_Hollow.wav", "aud/S2_Harsh.wav", "aud/S2_Soft.wav", "aud/S2_Trumpet.wav", "aud/S3_Asym.wav", "aud/S3_Dist.wav", "aud/S3_Harsh.wav", "aud/S3_Hollow.wav", "aud/S3_Soft.wav", "aud/S3_Voice.wav", "aud/S4_Asym.wav", "aud/S4_Dist.wav", "aud/S4_Hollow.wav", "aud/S4_Harsh.wav", "aud/S4_Soft.wav", "aud/S4_Organ.wav"],
		label: [["recognizable", "arbitrary"], ["soft", "harsh"], ["balanced", "unbalanced"], ["hollow", "solid"], ["clear", "distorted"], ["simple", "complex"]]
	};

	let instructions = {
		initial: "Sound is an important part of this study. As such, please ensure that you are wearing headphones throughout testing and that your computer's volume is set to a comfortable level.<br />You should try to be in a quiet place away from distractions while you're participating in this study.<br /> Please go at your own pace and take as many breaks as you need. <br />This experiment should take approximately 50 minutes to complete.",
		semantic: "Within each trial in this block, you'll be rating either a sound or shape on six different scales. <br /> (press SPACE to begin this block)",
		association: "Within each trial in this block you'll see a collection of shapes and a sound will be played. Using the mouse, click on the shape you feel best matches the sound you heard. <br />At any time you can replay the sound by pressing 'P'. <br />When you are happy with your choice, press spacebar to finalize it.<br /> (press SPACE to begin this block)",
		completion: "Congratulations, you have successfully completed this study. Thank you for participating!"
	};

	let additional_styling = {
		".slider-track": {height: `${Math.ceil(0.5 * dva_mgr.one_dva)}px`},
		"#slider-notch": {
			/****                            every time you need a magnitude in px, express it as a fraction of one_dva;
			 *                               and we only store one_dva IN the DVAManager to obviate miscommunication;
			 *                               next note is at the bottom of the doc ;)
			 * */
			height: `${Math.ceil(0.5 * dva_mgr.one_dva)}px`,
			width: `${Math.ceil(0.05 * dva_mgr.one_dva)}px`
		},
		"div.slider-wrapper": {
			"height": `${dva_mgr.one_dva}px`,
			"width": `${Math.ceil(9 * dva_mgr.one_dva)}px`,
			"margin": `${Math.ceil(0.5 * dva_mgr.one_dva)}px auto`,
			"box-sizing": "border-box"
		},
		"div.slider-wrapper div": {
			"display": "inline-block",
			"vertical-align": "top"
		},
		"div.slider-label": {
			"box-sizing": "border-box",
			"font-size": "18px",
			"width": `${Math.ceil(2 * dva_mgr.one_dva)}px`,
			"height": `${Math.ceil(0.6 * dva_mgr.one_dva)}px`,
			"margin-top": `${Math.ceil(0.2 * dva_mgr.one_dva)}px`
		},
		"#slider-label-left": {
			"text-align": "right",
			"margin-right": `${Math.ceil(0.3 * dva_mgr.one_dva)}px`
		},
		"#slider-label-right": {
			"text-align": "left",
			"margin-left": `${Math.ceil(0.3 * dva_mgr.one_dva)}px`
		},
		"div.slider-track-wrapper": {
			"position": "relative",
			"width": `${Math.ceil(4 * dva_mgr.one_dva)}px`,
			"padding": `${Math.ceil(0.1 * dva_mgr.one_dva)}px 0px`
		},
		"#slider-track": {
			"width": "100%",
			"height": `${Math.ceil(0.15 * dva_mgr.one_dva)}px`,
			"background-color": "white",
			"position": "absolute",
			"top": `${Math.ceil(0.4 * dva_mgr.one_dva)}px`,
			"left": "0px"
		},
		"div#slider-notch": {
			"background-color": "white",
			"position": "absolute",
			"left": `${Math.ceil(2 * dva_mgr.one_dva)}px`,
			"top": `${Math.ceil(0.2 * dva_mgr.one_dva)}px`
		}

	};

	let timeline = [];


	let build = {
		association_task: {
			build: true,
			repeat_tones: 4,
			gen_trials: [2, stimuli.audio.length] // just lets the dev run a subset for testing
		},
		semantic_task: {
			build: true,
			repeat_all: 2,
			gen_trials: [2, stimuli.audio.length] // just lets the dev run a subset for testing
		},
		randomize_task_order: true,
		full_screen: <?=$dev['fs'] === '1' ? 'true' : 'false';?>,
		dva_mgr: <?=$dev['dva'] === '1' ? 'true' : 'false'?>
	};

	let association_trials = [];
	let semantic_trials = [];
	let all_trials = [];

	if (build.full_screen) {
		timeline.push({
			type: 'fullscreen',
			fullscreen_mode: true
		});
	}


	// if association task is "turned on", populate it's trial array
	if (build.association_task.build) {
		for (let i = 0; i < build.association_task.repeat_tones; i++) {
			for (let j = 0; j < build.association_task.gen_trials[1]; j++) {
				association_trials.push({
					type: 'image-grid-click-response',
					image: stimuli.image,
					prompt: null,
					response_ends_trial: true,
					randomize_grid: true,
					image_metrics: {width: 3.5, height: 3.5, border_width: 0.2, border_color: "white", padding: .25},
					grid_size: [6, 4],
					audio: [stimuli.audio[j]],
					replay_cfg: {
						allow: true,
						key: "P",
						instructions: "Click on the shape that best matches the sound (space to confirm, p to replay sound)",
						max_replays: false
					},
					confirm_key: " ",
					max_replays: false,
					post_trial_gap: 2000,
					cfg: {
						data_template: data_template,
						data_repo: data_repo,
						one_dva: dva_mgr.one_dva,
						additional_styles: additional_styling
					}
				})
			}
		}
	}

	// if semantic task is "turned on", populate it's trial array
	if (build.semantic_task.build) {
		for (let i = 0; i < build.semantic_task.repeat_all; i++) {
			// add a complete set of audio trials
			for (let j = 0; j < build.semantic_task.gen_trials[1]; j++) {
				semantic_trials.push({
					type: 'multimedia-discrimination-slider',
					image: [],
					audio: [stimuli.audio[j]],
					prompt: null,
					image_metrics: {width: 3.5, height: 3.5, border_width: 0.2, border_color: "white", padding: 0.2},
					confirm_cfg: {
						allow: true,
						key: " ",
						instructions: "Click within the slider to rate on each scale. (space to confirm, p to replay sound)",
						max_replays: false
					},
					replay_cfg: {allow: true, key: "P", max_replays: false},
					max_replays: false,
					evaluations: stimuli.label,
					post_trial_gap: 2000,
					cfg: {
						/**                                                   if building elements with a custom plugin,
						 *                                                     ensure it get passed the value of one_dva
						 */
						dva_mgr: dva_mgr,
						data_template: data_template,
						data_repo: data_repo,
						one_dva: dva_mgr.one_dva,
						additional_styles: additional_styling
					}
				})
			}

			for (let j = 0; j < build.semantic_task.gen_trials[1]; j++) {
				semantic_trials.push({
					type: 'multimedia-discrimination-slider',
					image: [stimuli.image[j]],
					audio: [],
					prompt: null,
					image_metrics: {width: 3.5, height: 3.5, border_width: 0.2, border_color: "white", padding: 0.2},
					confirm_cfg: {
						allow: true,
						key: " ",
						instructions: "Click within the slider to rate on each scale. (space to confirm)",
						max_replays: false
					},
					replay_cfg: {allow: true, key: "P", max_replays: false},
					max_replays: false,
					evaluations: stimuli.label,
					post_trial_gap: 2000,
					cfg: {
						data_template: data_template,
						data_repo: data_repo,
						dva_mgr: dva_mgr,
						one_dva: dva_mgr.one_dva,
						additional_styles: additional_styling
					}
				})
			}
		}
	}


	association_trials = array_shuffle(association_trials).slice(0, <?=$dev['at'];?>);
	association_trials.unshift({
		type: "html-keyboard-response",
		stimulus: instructions.association
	});
	semantic_trials = array_shuffle(semantic_trials).slice(0, <?=$dev['st'];?>);
	semantic_trials.unshift({
		type: "html-keyboard-response",
		stimulus: instructions.semantic
	});

	if (build.randomize_task_order) {
		all_trials = Math.random() > 0.5 ? association_trials.concat(semantic_trials) : semantic_trials.concat(association_trials)
	} else {
		all_trials = association_trials.concat(semantic_trials)
	}

	all_trials.unshift({
		type: "html-keyboard-response",
		stimulus: instructions.initial,
	});
	all_trials.push({
		type: "html-keyboard-response",
		stimulus: instructions.completion
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

				KLect.send('klein', 'dan_gurman', 'crossmodal_correspondence', 'daniel.gurman1@gmail.com', '../..', data_repo);
			}
		});
	};


	function demographics() {
		let run_demos = <?=$dev['demo'] === '1' ? 'true' : 'false';?>;
		if (run_demos) {
			let years = [$("<option />").attr('value', false).html('')];
			for (let y = 17; y <= 80; y++) {
				years.push($("<option />").attr('value', y).html(y))
			}

			$("body").append(
				$("<div />").attr('id', 'demographics').append([
					$("<form />").append([
						$("<div />").addClass('input-wrapper').append([
							$("<label />").html("What is  your banner ID?"),
							$("<input />").attr({'type': 'text', 'id': 'banner'})
						]),
						$("<div />").addClass('input-wrapper').append([
							$("<label />").html("What is your age in years?"),
							$("<select />").attr('id', 'age').append(years)
						]),
						$("<div />").addClass('input-wrapper').append([
							$("<label />").html("What is your sex?"),
							$("<select />").attr('id', 'sex').append([
								$("<option />").attr('value', false).html(''),
								$("<option />").attr('value', 'male').html('male'),
								$("<option />").attr('value', 'female').html('female')
							])
						]),
						$("<div />").addClass('input-wrapper').append([
							$("<label />").html("How would you describe your level of musical expertise? Please select the best option."),
							$("<select />").attr('id', 'musicality').append([
								$("<option />").attr('value', false).html(''),
								$("<option />").attr('value', 'casual').html('Casual Listener'),
								$("<option />").attr('value', 'novice').html('Novice'),
								$("<option />").attr('value', 'moderate').html('Moderate'),
								$("<option />").attr('value', 'proficient').html('Proficient'),
								$("<option />").attr('value', 'expert').html('Expert'),
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
						$("<div />").addClass('input-wrapper').append([
							$("<label />").html("Do you have synesthesia?"),
							$("<p />").addClass('note').html("(A neurological condition in which an experience in one sense, such\n" +
								"as hearing, causes an automatic and involuntary experience in a second sense, such as vision.\n" +
								"For example, someone with synesthesia may experience hearing colours.)"),
							$("<select />").attr('id', 'synesthesia').append([
								$("<option />").attr('value', false).html(''),
								$("<option />").attr('value', 'yes').html('Yes'),
								$("<option />").attr('value', 'no').html('No')
							])
						]),
					]),
					$("<div />").attr('id', 'demographics-warning').addClass('hidden').html('Please complete each question before submitting.'),
					$("<div />").attr('id', 'demographics-submit').html('submit')
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
				let demos = copy(data_template);
				demos.trial_type = $("#banner").val();
				demos.choice_file = $("#age").val();
				demos.choice_index = $("#sex").val();
				demos.img = $("#musicality").val();
				demos.left_label_0 = $("#handedness").val();
				demos.left_label_1 = $("#synesthesia").val();
				data_repo.push(demos);
				$("#demographics").remove();
				$("#demographics-styling").remove();
				dva_mgr.init(!build.dva_mgr);

			})
		} else {
			dva_mgr.init(!build.dva_mgr);
        }
	}


	demographics();

</script>
</body>
</html>