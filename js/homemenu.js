window.addEventListener("load", () => {
    // Pages in subfolders set window.ASSET_BASE = '../' before loading this file
    var AB = window.ASSET_BASE || '';
    document.body.insertAdjacentHTML("beforeend", `
        <div class="home-menu">
            <div class="bar-top close-pause-menu">
                <span>HOME Menu</span>
                <img src="${AB}assets/home-close.png" />
            </div>
            <div class="in-between">
                <a class="buttonlike backtomenu" onmouseover="playSFX('button-hover.mp3', userConfig.sfxVol)">Wii Menu</a>
            </div>
            <div class="bar-bottom">
                <img src="${AB}assets/remote.png" class="remote" />
                <div>
                    <div class="battery">
                        <div>
                            <span>P1</span>
                            <img src="${AB}assets/power-full.png" />
                        </div>
                        <div>
                            <span>P2</span>
                            <img src="${AB}assets/power-empty.png" />
                        </div>
                        <div>
                            <span>P3</span>
                            <img src="${AB}assets/power-empty.png" />
                        </div>
                        <div>
                            <span>P4</span>
                            <img src="${AB}assets/power-empty.png" />
                        </div>
                    </div>
                    <div class="text">Wii Remote Settings</div>
                </div>
            </div>
        </div>
        <div class="returndialog">
            <div class="msgbox">
                <div class="text">
                    Return to the Wii Menu?<br>
                    (Anything not saved will be lost.)
                </div>
                <div class="actions">
                    <a onclick="rm2();" onmouseover="playSFX('button-hover.mp3', userConfig.sfxVol)">Yes</a>
                    <a class="closedialog" onmouseover="playSFX('button-hover.mp3', userConfig.sfxVol)" onclick="playSFX('button-cancel.mp3', userConfig.sfxVol)">No</a>
                </div>
            </div>
        </div>
    `);
    
    var lastBgMusicState;
    
    function openHomeMenu() {
        lastBgMusicState = getBGMusicState();
        if (getBGMusicState().intro) bgMusicIntroToggle();
        if (getBGMusicState().main) bgMusicToggle();
        playSFX('home-in.mp3', userConfig.sfxVol);
        $(".home-menu").css("display", "grid");
        $('.home-menu')[0].ariaLabel = 'on';
    }

    function closeHomeMenu() {
        $(".home-menu").addClass("fadeOut");
        setTimeout(() => {
            $(".home-menu").css("display", "none");
            $(".home-menu").removeClass("fadeOut");
        }, 250);
        playSFX('button-cancel.mp3', userConfig.sfxVol);
        if (lastBgMusicState && lastBgMusicState.intro) bgMusicIntroToggle();
        if (lastBgMusicState && lastBgMusicState.main) bgMusicToggle();
        $('.home-menu')[0].ariaLabel = null;
    }

    function toggleHomeMenu() {
        if ($('.home-menu')[0].ariaLabel !== 'on') openHomeMenu();
        else closeHomeMenu();
    }

    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 27 || e.key === 'Escape') {
            e.preventDefault();
            toggleHomeMenu();
        }
    });

    // The welcome screen's tip says "Right-click to open the Wii pause menu"
    document.addEventListener('contextmenu', function(e) {
        // keep the normal menu inside text boxes (copy/paste)
        if (e.target.closest && e.target.closest('input, textarea')) return;
        e.preventDefault();
        toggleHomeMenu();
    });

    $(".close-pause-menu").click(event => {
        closeHomeMenu();
    });
    
    $(".backtomenu").click(event => {
        $(".returndialog").css("display", "flex");
        playSFX('button-select-big.mp3', userConfig.sfxVol);
    });
    
    $(".closedialog").click(event => {
        $(".returndialog").css("display", "none");
    });
});