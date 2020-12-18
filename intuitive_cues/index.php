<?php
    $dev = array_merge(array("fs" => '1', "dva" => '1', "one_dva" => 50, "st" => 96, "at" => 96, "demo"=> '1',"mute" => '0', 'demo' => '1'), $_GET);
    $pre_path = function_exists("gethostname") ? "../.." : "../..";
	$one_dva = 50;
?>
<html>
<head>
    <title>Intuitive Cues</title>
    <script
            src="https://code.jquery.com/jquery-3.4.1.min.js"
            integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
            crossorigin="anonymous"></script>
    <script src="<?= $pre_path; ?>/lib/utilities.js"></script>
    <script src="<?= $pre_path; ?>/lib/jspsych.js"></script>
    <script src="<?= $pre_path; ?>/lib/KLect.js"></script>
    <script src="<?= $pre_path; ?>/lib/jspsych-audio-keyboard-response.js"></script>
    <script src="<?= $pre_path; ?>/lib/jspsych-html-keyboard-response.js"></script>
    <script src="<?= $pre_path; ?>/lib/jspsych-fullscreen.js"></script>
    <script src="<?= $pre_path; ?>/lib/DVA_Manager.js"></script>
    <link href="css/jspsych.css" rel="stylesheet" type="text/css"/>
    <script src="js/intuitive-cues.js"></script>
    <style>
        body {
        background-color: rgba(45,45,48,255);
        font-family: sans-serif;
        color: white
        }
        .fix-dash {
            width: <?=0.1 * $one_dva;?>px;
            height: 2px;
            background-color: white;
            margin-right: 5px;
            display: inline-block;
        }

        .circle {
            border-radius: 9999px;
            height: <?=2 * $one_dva;?>px;
            width: <?=2 * $one_dva;?>px;
        }

        .circle.black { background-color: black;}
        .circle.white { background-color: white;}

        p#rt {
            font-size: <?=2 * $one_dva;?>px;
        }

        p#rt.black { color: black;}
        p#rt.white { color: white;}
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
	let dva_mgr = new DVAManager();
	dva_mgr.one_dva = <?=$one_dva;?>;
    let data = [];
	let timeline = [];

	let stimuli = {
		audio:{
			t1: {
	            file: "aud/Mono_10sec_6amp.wav",
		        duration: 6.0
            },
			t2a: {
				file: "aud/Stereo_100ms_6amp.wav",
				duration: .1
			},
			t2b: {
				file: "aud/Stereo_100ms_10amp.wav",
				duration: .1
			},
            test: {
				file: "aud/test_tones.wav"
            }
        },
        SOA: {
			short: 200,
            long :1400
        },
		html: {
            fix: {
            	short: $("<div />").addClass('fixation').html("--"),
                long: $("<div />").addClass('fixation').html("--------")
            },
			target: {
				white: $("<div />").addClass('circle', 'white'),
				black: $("<div />").addClass('circle', 'black')
			}
        }
	};

	// init audio for main tone

    let instructions = {
	    initial: "Sound is an important part of this study. As such, please ensure that you are wearing headphones throughout testing and that your computer's volume is set to a comfortable level.<br />You should try to be in a quiet place away from distractions while you're participating in this study.<br /> Please go at your own pace and take as many breaks as you need. <br />This experiment should take approximately 50 minutes to complete.",
	    completion: "Congratulations, you have successfully completed this study. Thank you for participating!"
    };

	let build = {
		discrimination_task: {
			build: true,
			repeat_tones: 1
		},
		semantic_task: {
			build: true,
			repeat_all: 1
		},
		randomize_task_order: true,
		full_screen: <?=$dev['fs'] === '1' ? 'true' : 'false';?>,
        dva_mgr: <?=$dev['dva'] === '1' ? 'true' : 'false';?>,
        mute:<?=$dev['mute'] === '1' ? 'true' : 'false';?>,
        max_fix: 2
	};


	if (build.full_screen) {
		timeline.push({
			type: 'fullscreen',
			fullscreen_mode: true
		});
	}


    let blocks = {
    	low_amp: [],
        high_amp: []
    };

	// fixation audio soa cue_validity target_color

    for (let i = 0; i < 2; i++) { // number of repititions
        for (let f = 0; f < 2; f++) { // short/long fixation
            let fix = f % 2 ? stimuli.html.fix.short : stimuli.html.fix.long;

            for (let t = 0; t < 2; t++) {
            	let block = t % 2 ? "low_amp" : "high_amp";
                let tone = t % 2 ? stimuli.audio.t2a.file : stimuli.audio.t2b.file;

                for (let s = 0; s < 5; s++) {
                    let soa = null;
                    let cue_validity = null;
                    if (s > 1) {
                        soa = fix === stimuli.html.fix.short ? stimuli.SOA.long : stimuli.SOA.short;
                        cue_validity = "invalid";
                    } else {
                        soa = fix === stimuli.html.fix.short ? stimuli.SOA.short : stimuli.SOA.long;
                        cue_validity = "valid";
                    }

                    blocks[block].push({
                        type: 'intuitive-cues',
                        fixation: fix,
                        audio: "aud/test_tones.wav",
                        soa: soa,
                        cue_validity: cue_validity,
                        target_color: Math.floor(Math.random() * 10) % 2 ? "black" : "white",
                        cfg: {
                        	mute: build.mute,
                        	one_dva: dva_mgr.one_dva,
                            data_repo:data,
                            data_template: {
                        		rt: null,
                                soa: null,
                                block: null,
                                tone: null,
                                cue: null,
                                validity: null
                            }
                        }

                    })
                }
            }
        }
    }



	// all_trials.unshift({
	// 	type: "html-keyboard-response",
	// 	stimulus: instructions.association
	// });
	// semantic_trials = array_shuffle(semantic_trials);
    // discrim_trials.unshift({
	//     type: "html-keyboard-response",
	//     stimulus: instructions.semantic
    // });
	let all_trials = Math.random() > 0.5 ? blocks.low_amp.concat(blocks.high_amp) : blocks.high_amp.concat(blocks.low_amp);

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
    dva_mgr.launch = function() {

		/* start the experiment */
		jsPsych.init({
			timeline: timeline,
			show_progress_bar: false,
			on_finish: function () {
				KLect.send('klein', 'colin_mccormick', 'intuitive_cues', 'colin.mccorkmick@dal.ca');
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
				let demos = {};
				demos.trial_type = $("#banner").val();
				demos.choice_file = $("#age").val();
				demos.choice_index = $("#sex").val();
				demos.img = $("#musicality").val();
				demos.left_label_0 = $("#handedness").val();
				demos.left_label_1 = $("#synesthesia").val();
				data.push(demos);
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