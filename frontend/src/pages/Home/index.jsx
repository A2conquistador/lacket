import { Link } from "react-router-dom";
import { config } from "@stores/config";
import styles from "@styles";
import Background from "@components/Background";
export default function Home() {
    return (
        <>
            <div className={styles.home.headerContainer}>
                <img src="/content/homeBlooks.png" alt="Blooks" className={styles.home.headerImage} draggable="false" />
                <Background />
                <div className={styles.home.headerSide} />
                <div className={styles.home.topHeaderContainer}>
                    <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                        <div style={{width:'42px',height:'42px',background:'linear-gradient(135deg,#3b9eff,#6366f1)',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:'900',color:'white',fontFamily:'sans-serif',boxShadow:'0 4px 14px rgba(59,158,255,0.4)',flexShrink:0}}>L</div>
                        <div className={styles.home.logoText}>{config.name}</div>
                    </div>
                </div>
                <div className={styles.home.welcomeContainer}>
                    <div className={styles.home.welcomeText}>
                        {config.welcome && config.welcome.split(" ").map((word, i) => (<div key={i}>{word}</div>))}
                    </div>
                    <div className={styles.home.welcomeDesc}>
                        {config.description && config.description.split(",").map((word, i) => (<div key={i}>{word}</div>))}
                    </div>
                    <div className={styles.home.welcomeButtonContainer}>
                        <Link className={styles.home.welcomeButton} to="/register">Register</Link>
                        {config.discord !== "" && <a className={styles.home.welcomeButton} href={`https://discord.com/invite/${config.discord}`} target="_blank">Discord</a>}
                    </div>
                    {config.pronunciation !== "" && <div className={styles.home.pronounceButton} onClick={() => new Audio("/content/pronunciation.ogg").play()}>
                        <i className="fas fa-volume-up" /> Pronunciation ("{config.pronunciation}")
                    </div>}
                </div>
            </div>
            <div className={styles.home.topButtonContainer}>
                <Link className={`${styles.home.topButton} ${styles.home.loginButton}`} to="/login">Login</Link>
                <Link className={`${styles.home.topButton} ${styles.home.registerButton}`} to="/register">Register</Link>
            </div>
            <div className={styles.home.copyrightInformation}>
                We are not affiliated with Blooket in any way.
                <br />
                Please do not contact Blooket about any issues you may have with {config.name}.
                <br />
                {config.name} © {new Date().getFullYear()} All Rights Reserved.
            </div>
            <div className={styles.home.versionInformation}>Running Blacket v{config.version}</div>
            <Link to="/terms" className={styles.home.termsOfServiceLink}>Terms of Service</Link>
        </>
    )
}
