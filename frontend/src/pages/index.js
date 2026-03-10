import Loading from './Loading';
import Errors from './Errors';
import Home from './Home';
import Authentication from './Authentication';
import Dashboard from './Dashboard';
import Game from './Game';
import SoloPlay from './Game/SoloPlay';
import Classic from './Game/Classic';
import GoldQuest from './Game/GoldQuest';
import TowerDefense from './Game/TowerDefense';
import BattleRoyale from './Game/BattleRoyale';
import Factory from './Game/Factory';
import Cafe from './Game/Cafe';
import Market from './Market';
import Shop from './Shop';
import Play from './Play';
import Chat from './Chat';
import Profile from './Profile';
import DailyReward from './DailyReward';

Game.SoloPlay = SoloPlay;
Game.Classic = Classic;
Game.GoldQuest = GoldQuest;
Game.TowerDefense = TowerDefense;
Game.BattleRoyale = BattleRoyale;
Game.Factory = Factory;
Game.Cafe = Cafe;

export default { DailyReward, Play, Chat, Loading, Errors, Home, Authentication, Dashboard, Game, Market, Shop, Profile }
