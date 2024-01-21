import React from "react"
import Shadow from "../../examplex/Shadow"
import VirtualScrollBar from "../../components/VirtualScrollBar"
import Container from "../../components/Container"
import styles from "./index.module.less"
import GithubIcon from "./Github"

const itemHeight = 40

const bigList = Array.from({length: 100000}, (_v, i) => i)

function Index() {
	
	return (
		<div className={ styles.layout }>
			<div className={ styles.layoutWrapper }>
				<div className={styles.layoutHeader}>React 版本滚动条 <a href="https://github.com/kampiu/better-scrollbar"><GithubIcon /></a></div>
				<div>
					滚动原理参考 <a href="https://github.com/malte-wessel/react-custom-scrollbars">react-custom-scrollbars</a> ，其中针对虚拟滚动以及原仓库中的issue有针对性改动。
				</div>
			</div>
			<div className={ styles.layoutSection }>
				<div className={ styles.layoutHeader }>案例</div>
				
				<div className={ styles.containerWrapper }>
					<Container
						title="虚拟滚动条"
						desc="大数据表场景下通过劫持children注入props优化滚动性能。"
						className={ styles.container }
					>
						<VirtualScrollBar
						>
							{
								bigList.map((item, index) => (
									<div key={ item } className={ styles.item } style={ {
										height: itemHeight,
										transform: `translateY(${ index * itemHeight }px)`
									} }>{ item + 1 }</div>
								))
							}
						</VirtualScrollBar>
					</Container>
					<Container
						title="阴影滚动条"
						desc="当滚动条隐藏场景下可通过阴影效果提示滚动区域内存在部分内容被遮挡，可通过滚动预览更多内容。"
						className={ styles.container }
					>
						<Shadow />
					</Container>
				</div>
			</div>
		
		</div>
	)
}

export default Index
