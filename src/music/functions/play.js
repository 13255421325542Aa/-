const ytdl = require("ytdl-core");
const voice = require("@discordjs/voice");
const { CommandInteraction } = require("discord.js");
const replys = require("../../modules/replys.json");
const yt = require("yt-search");
const SoundCloud = require("soundcloud-scraper");
const spotify = require("spotify-url-info");
const data = require("../assets/.js");

/**
 *
 * @param {CommandInteraction} interaction
 * @param {string} song
 */

module.exports.play = async (interaction, song, setup) => {
  if (setup == false)
    interaction
      .followUp({
        content: replys.tryingPlayMusic,
        ephemeral: true,
        allowedMentions: {
          repliedUser: false,
        },
      })
      .catch(() => {});
  if (interaction.guild.me.voice.channel) {
    if (interaction.member.voice.channel) {
      if (
        interaction.guild.me.voice.channel.id ==
        interaction.member.voice.channel.id
      ) {
        await songFilter(interaction, song, setup);
      } else {
        if (setup == false)
          return interaction.editReply({
            content: replys.notInTheSameVoiceChannel,
            ephemeral: true,
            allowedMentions: {
              repliedUser: false,
            },
          });
      }
    } else {
      if (setup == false)
        return interaction.editReply({
          content: replys.notInVoiceChannel,
          ephemeral: true,
          allowedMentions: {
            repliedUser: false,
          },
        });
    }
  } else {
    if (interaction.member.voice.channel) {
      await songFilter(interaction, song);
    } else {
      if (setup == false)
        return interaction.editReply({
          content: replys.notInVoiceChannel,
          ephemeral: true,
          allowedMentions: {
            repliedUser: false,
          },
        });
    }
  }
};

/**
 *
 * @param {CommandInteraction} interaction
 * @param {{
 *         playlist: boolean
 *         url: string | string[]
 *        }} song
 */
async function play(interaction, song, setup) {
  let voiceChannel = interaction.member.voice.channel;
  if (song.playlist == false) {
    let url = song.url;
    let guildData = data.get(interaction.guildId);
    if (!guildData) {
      let queueConstructor = {
        vc: voiceChannel,
        connection: null,
        songs: [],
        pause: false,
        loop: false,
        last: null,
        resource: null,
        player: null,
      };
      queueConstructor.songs.push(url);
      try {
        const connection = await voice.joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
          selfDeaf: false,
        });
        connection;
        connection.on("error", () => {
          return;
        });
        queueConstructor.connection = connection;
        data.set(interaction.guildId, queueConstructor);
        playerF(interaction, queueConstructor.songs[0], setup);
      } catch (err) {
        data.delete(interaction.guild.id);
        throw err;
      }
    } else {
      guildData.songs.push(song.url);
      try {
        let track = (await ytdl.getInfo(song.url)).videoDetails;
        if (track) {
          if (setup == false)
            require("../player").Events.emit("addSong", interaction, {
              title: track.title,
              author: track.author,
              url: track.video_url,
              id: track.videoId,
              duration: track.lengthSeconds,
              thumbnail:
                track.thumbnails[4]?.url ||
                "https://media.discordapp.net/attachments/950102464701558845/950435985118879786/unnamed.png",
              likes: track.likes,
              dislikes: track.dislikes,
              viewCount: track.viewCount,
              keywords: track.keywords,
            });
          else
            require("../player").Events.emit("setupAddSong", interaction, {
              title: track.title,
              author: track.author,
              url: track.video_url,
              id: track.videoId,
              duration: track.lengthSeconds,
              thumbnail:
                track.thumbnails[4]?.url ||
                "https://media.discordapp.net/attachments/950102464701558845/950435985118879786/unnamed.png",
              likes: track.likes,
              dislikes: track.dislikes,
              viewCount: track.viewCount,
              keywords: track.keywords,
            });
        }
      } catch (err) {
        console.log(err);
      }
    }
  } else {
    return;
  }
}

/**
 *
 * @param {string} song
 */
async function songFilter(i, song, setup) {
  if (song.includes("https://")) {
    if (song.includes("youtube.com") || song.includes("youtu.be"))
      play(
        i,
        {
          playlist: false,
          url: song,
        },
        setup
      );
    else if (song.includes("soundcloud.com")) {
      let client = new SoundCloud.Client();
      let url = (await yt.search((await client.getSongInfo(song)).title))
        .videos[0].url;
      play(
        i,
        {
          playlist: false,
          url: url,
        },
        setup
      );
    } else if (song.includes("spotify.com/track")) {
      let url = (await yt.search((await spotify.getPreview(song)).title))
        .videos[0].url;
      play(
        i,
        {
          playlist: false,
          url: url,
        },
        setup
      );
    } else if (song.includes("spotify.com/playlist")) {
      if (setup == false)
        return interaction.editReply({
          content: replys.spotifyPlaylistIsNotAllowed,
          ephemeral: true,
          allowedMentions: {
            repliedUser: false,
          },
        });
    } else {
      if (setup == false)
        return interaction.editReply({
          content: replys.notAllowedUrl,
          ephemeral: true,
          allowedMentions: {
            repliedUser: false,
          },
        });
    }
  } else {
    let url = (await yt.search(song)).videos[0].url;
    play(
      i,
      {
        playlist: false,
        url: url,
      },
      setup
    );
  }
}
/**
 *
 * @param {CommandInteraction} interaction
 * @param {string} song
 * @returns
 */
async function playerF(interaction, song, setup) {
  let guildData = await data.get(interaction.guildId);
  if (!song) {
    if (guildData) guildData.connection.destroy(true);
    data.delete(interaction.guildId);
    require("../player").Events.emit("setupStop", interaction);
    return;
  }
  const player = await voice.createAudioPlayer({
    behaviors: {
      noSubscriber: voice.NoSubscriberBehavior.Pause,
    },
  });
  var stream = ytdl(song, { filter: "audioonly" });
  stream.on("end", () => console.log("end of track!."));
  stream.on("close", () => console.log("connection dot close!."));
  stream.on("error", (err) => console.log(err));
  guildData.player = player;
  const resource = voice.createAudioResource(stream, { inlineVolume: true });
  guildData.resource = resource;
  player.play(resource);
  guildData.connection.subscribe(player);
  player.on(voice.AudioPlayerStatus.Idle, () => {
    guildData.last = guildData.songs[0];
    if (guildData.pause == false) {
      if (guildData.loop == false) guildData.songs.shift();
      playerF(interaction, guildData.songs[0], setup);
    }
  });
  try {
    let track = (await ytdl.getInfo(song)).videoDetails;
    if (track) {
      if (setup == false)
        require("../player").Events.emit("playSong", interaction, {
          title: track.title,
          author: track.author,
          url: track.video_url,
          id: track.videoId,
          duration: track.lengthSeconds,
          thumbnail:
            track.thumbnails[4]?.url ||
            "https://media.discordapp.net/attachments/950102464701558845/950435985118879786/unnamed.png",
          likes: track.likes,
          dislikes: track.dislikes,
          viewCount: track.viewCount,
          keywords: track.keywords,
        });
      else
        require("../player").Events.emit("setupPlaySong", interaction, {
          title: track.title,
          author: track.author,
          url: track.video_url,
          id: track.videoId,
          duration: track.lengthSeconds,
          thumbnail:
            track.thumbnails[4]?.url ||
            "https://media.discordapp.net/attachments/950102464701558845/950435985118879786/unnamed.png",
          likes: track.likes,
          dislikes: track.dislikes,
          viewCount: track.viewCount,
          keywords: track.keywords,
        });
    }
  } catch (err) {
    console.log(err);
  }
  player.on("error", () => {
    return;
  });
  player.on("debug", () => {
    return;
  });
  guildData.connection.on("error", () => {
    return;
  });
}
