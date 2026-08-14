
    ControllerRecent.prototype = Object.create(baseController.prototype);
    ControllerRecent.prototype.constructor = ControllerRecent;
    const isSvgIcons = window.devicePixelRatio >= 2 || window.devicePixelRatio === 1;
    var ViewRecent = function (args) {
        var _lang = utils.Lang;

        // args.id&&(args.id=`"id=${args.id}"`)||(args.id='');

        // localStorage.removeItem('welcome');


		//language=HTML
        // Offline build: render the help text as plain text instead of a
        // hyperlink to an external help center.
        const helpLink = `<span class="link">${_lang.textHelpCenter}</span>`;
		const welcomeBannerTemplate = !localStorage.getItem('welcome') ? `
            <div id="area-welcome">
                <h2 l10n>${_lang.welWelcome}</h2>
                <p l10n class="text-normal">${_lang.welDescr}</p>
                <p l10n class="text-normal">${_lang.welNeedHelp.replace('$1', helpLink)}</p>
            </div>` : '';

        //language=HTML
        args.tplPage = `
            <div class="action-panel ${args.action}">
                <div class="recent-panel-container">
                    <div class="search-bar hidden">
                        <h1 l10n>${_lang.welWelcome}</h1>
                    </div>

                    <section id="area-document-creation-grid"></section>
                    ${welcomeBannerTemplate}
