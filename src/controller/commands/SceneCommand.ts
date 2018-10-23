
module game {

    export class SceneCommand extends puremvc.SimpleCommand implements puremvc.ICommand {

        public constructor() {
            super();
        }
        public static NAME: string = "SceneCommand";

        /**
         * 切换场景
         */
        public static CHANGE: string = "scene_change";

        public static SHOW_VICTORY_WINDOW: string = "show_victory_window";

        public static SHOW_JOIN_WINDOW: string = "show_join_window";

        public static SHOW_USERINFO_WINDOW: string = "show_user_window";

        public static SHOW_NOTICE_WINDOW: string = "show_notice_window";
        public static SHOW_RANK_WINDOW: string = "show_rank_window";
        public static SHOW_GUIDE_WINDOW: string = "show_guide_window";
        public static SHOW_SETTING_WINDOW: string = "show_setting_window";
        public static SHOW_BAR_WINDOW: string = "show_bar_window";

        public static SHOW_ABOUT_WINDOW: string = "show_about_window";
        public static SHOW_RESULT_WINDOW: string = "show_result_window";

        public static SHOW_HANDLE_POPUP: string = "show_handle_popup";
        public static SHOW_PROMPT_POPUP: string = "show_prompt_popup";
        public static SHOW_FANG_POPUP: string = "show_fang_popup";
        public static SHOW_ROUND_POPUP: string = "show_round_popup";
        public static SHOW_ROLE_POPUP: string = "show_role_popup";
        public static SHOW_RESULT_POPUP: string = "show_result_popup";
        public static SHOW_APPRAISAL_POPUP: string = "show_appraisal_popup";
        public static SHOW_GAMEINFO_POPUP: string = "show_info_window";
        public static SHOW_NUMBER_KEYBOARD: string = "show_number_keyboard"

        public static SHOW_VOTERECORD_WINDOW: string = "show_voterecord_window"
        public static SHOW_GUIDE_VIDEO: string = "show_guide_video";
        public static SHOW_GUIDE_PROCESS: string = "show_guide_process";
        public static SHOW_GUIDE_ROLE: string = "show_guide_role";
        public static SHOW_GUIDE_WINJUDGE: string = "show_guide_winjudge";
        public static SHOW_GUIDE_TERM: string = "show_guide_term";

        public register(): void {
            this.initializeNotifier("ApplicationFacade");
        }

        initializeNotifier(key: string) {
            super.initializeNotifier(key);
            this.facade().registerCommand(SceneCommand.CHANGE, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_VICTORY_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_JOIN_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_USERINFO_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_NOTICE_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_RANK_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_GUIDE_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_SETTING_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_ABOUT_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_BAR_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_RESULT_WINDOW, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_HANDLE_POPUP, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_PROMPT_POPUP, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_FANG_POPUP, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_ROUND_POPUP, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_ROLE_POPUP, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_RESULT_POPUP, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_APPRAISAL_POPUP, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_ROUND_POPUP, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_GAMEINFO_POPUP, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_NUMBER_KEYBOARD, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_GUIDE_VIDEO, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_GUIDE_PROCESS, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_GUIDE_ROLE, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_GUIDE_WINJUDGE, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_GUIDE_TERM, SceneCommand);
            this.facade().registerCommand(SceneCommand.SHOW_VOTERECORD_WINDOW, SceneCommand);
        }

        public async execute(notification: puremvc.INotification): Promise<any> {
            const data = notification.getBody();
            const appMediator: ApplicationMediator = this.facade().retrieveMediator(ApplicationMediator.NAME) as ApplicationMediator;
            const gameProxy: GameProxy = this.facade().retrieveProxy(GameProxy.NAME) as GameProxy;

            switch (notification.getName()) {
                case SceneCommand.CHANGE: {
                    if (data == Scene.Start) {
                        appMediator.main.enterStartScreen();
                    }
                    else if(data == Scene.Level) {
                        appMediator.main.enterLevelScreen();
                    }
                    else if (data == Scene.Game) {
                        appMediator.main.enterGameScreen();
                    }
                    break;
                }
                case SceneCommand.SHOW_VICTORY_WINDOW: {
                    appMediator.main.showVictoryWindow();
                    break;
                }
            }
        }
    }
}