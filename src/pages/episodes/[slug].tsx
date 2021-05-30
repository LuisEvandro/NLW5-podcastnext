import { parseISO } from "date-fns";
import format from "date-fns/format";
import { ptBR } from "date-fns/locale";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { api } from "../../service/api";
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";

import styles from '../episodes/episode.module.scss';
import { usePlayer } from "../../contexts/PlayerContext";

interface Episode {
	id: string,
	title: string,
	description: string,
	thumbnail: string,
	members: string,
	publishedAt: string,
	url: string,
	duration: number,
	durationAsString: string,
	type: string
}

interface EpisodeProps {
	episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {

	const { play } = usePlayer()

	return (
		<div className={styles.episode}>
			<Head>
				<title>{episode.title} | Podcastr</title>
			</Head>

			<div className={styles.thumbnailContainer}>
				<Link href="/">
					<button type="button">
						<img src="/arrow-left.svg" alt="Voltar" />
					</button>
				</Link>
				<Image
					width={700}
					height={160}
					src={episode.thumbnail}
					objectFit="cover"
				/>
				<button type="button" onClick={() => play(episode)}>
					<img src="/play.svg" alt="Tocar episódio" />
				</button>
			</div>

			<header>
				<h1>{episode.title}</h1>
				<span>{episode.members}</span>
				<span>{episode.publishedAt}</span>
				<span>{episode.durationAsString}</span>
			</header>

			<div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description }} />
		</div>
	)
}

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [],
		fallback: 'blocking'
	}
}

export const getStaticProps: GetStaticProps = async (ctx) => {
	const { slug } = ctx.params

	const { data } = await api.get(`/episodes/${slug}`)

	const episode = {
		id: data.id,
		title: data.title,
		description: data.description,
		thumbnail: data.thumbnail,
		members: data.members,
		publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
		url: data.file.url,
		duration: Number(data.file.duration),
		durationAsString: convertDurationToTimeString(Number(data.file.duration)),
		type: data.file.type
	}

	return {
		props: {
			episode
		},
		revalidate: 60 * 60 * 24, //24 Horas
	}
}