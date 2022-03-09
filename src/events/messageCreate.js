const { Client, Message, MessageEmbed } = require("discord.js");
const { Song } = require("soundcloud-scraper");
const { AsyncResource } = require("async_hooks");
const db = require("quick.db");
const { play, events } = require("../clients/player");
const Col = new Map();
const runningSong = new Map();

/**
 *
 * @param {Message} msg
 * @param {Song} song
 * @param {Map<any, any>} data
 * @param {AsyncResource} resource
 * @returns
 */

function returnEmbed(msg, song, data, resource) {
  let returnEmbedClass = new MessageEmbed()
    .setTitle(`**${song.title}**`)
    .setImage(song.thumbnail);
  msg?.edit({
    embeds: [returnEmbedClass],
  });
}

/**
 *
 * @param {Client} client
 * @param {Message} message
 * @returns
 */

module.exports = async (client, message) => {
  let ifChannel = db.fetch(`Channel_${message.guildId}`);
  if (ifChannel == null) return;
  let channel = ifChannel.channel;
  let rawContent = message.content;
  if (!rawContent || rawContent == "") return;
  if (message.channelId == channel.id) {
    let msg = await message.channel.messages.fetch(
      db.fetch(`Channel_${message.guildId}`)?.messsageId
    );
    message.react("✅").catch(() => {});
    setTimeout(() => {
      message.delete().catch(() => {});
    }, 2314);
    play(message, rawContent, true);
    Col.set(message.guildId, false);
    events.on("setupAddSong", async (def, song) => {
      Col.set(message.guildId, true);
      let data = require("../music/assets/.js").get(def.guildId);
      if (!data) return;
      let resource = data.resource;
      if (!resource) return;
      let embed = new MessageEmbed()
        .setTitle(`**${song.title}**`)
        .setImage(song.thumbnail);
      let Tmsg = await def?.channel.messages.fetch(
        db.fetch(`Channel_${def.guildId}`)?.messsageId
      );
      // Tmsg?.edit({
      //   embeds: [embed],
      // }).then(() => {
      //   setTimeout(() => {
      //     returnEmbed(Tmsg, runningSong.get(def.guildId), data, resource);
      //   }, 1000 * 3);
      // });
    });
    events.on("setupPlaySong", async (def, song) => {
      runningSong.set(def.guildId, song);
      let data = require("../music/assets/.js").get(def.guildId);
      if (!data) return;
      let resource = data.resource;
      if (!resource) return;
      let embed = new MessageEmbed()
        .setTitle(`**${song.title}**`)
        .setImage(song.thumbnail);
      let Tmsg = await def?.channel.messages.fetch(
        db.fetch(`Channel_${def.guildId}`)?.messsageId
      );
      setTimeout(async () => {
        Tmsg?.edit({
          embeds: [embed],
        }).then(async (TheMessage) => {
          console.log(Col);
          if (Col.get(def.guildId) == true) return console.log("no");
          Col.set(def.guildId, false);
          console.log("yes");
          let aC = await TheMessage.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 1000 * 60 * 60 * 24,
          });
          aC.on("collect", async (button) => {
            try {
              if (!button) return;
              await button?.deferUpdate().catch(() => {});
              if (!data) return;
              if (!message.member.voice.channelId) return;
              if (!message.guild.me.voice.channelId) return;
              if (
                message.member.voice.channelId !==
                message.guild.me.voice.channelId
              )
                return;
              let guildData = data;
              switch (button.customId) {
                case "play_pause":
                  if (guildData.pause == false) {
                    guildData.player.pause();
                    guildData.pause = true;
                  } else {
                    guildData.player.unpause();
                    guildData.pause = false;
                  }
                  break;
                case "volume_up":
                  guildData.resource.volume.setVolume(
                    guildData.resource.volume.volume + 0.2
                  );
                  break;
                case "volume_down":
                  guildData.resource.volume.setVolume(
                    guildData.resource.volume.volume - 0.2
                  );
                  break;
                case "stop":
                  if (guildData?.connection)
                    guildData?.connection?.destroy(true);
                  require("../music/assets/.js").delete(button.guild.id);
                  let embed5 = new MessageEmbed()
                    .setTitle(`**No song playing currently**`)
                    .setDescription("Casper is a life style.")
                    .setFooter({
                      text: "all the bot commands woking with slashcommands",
                    })
                    .setImage(
                      "https://media.discordapp.net/attachments/950102464701558845/950435985118879786/unnamed.png"
                    );
                  msg.edit({
                    embeds: [embed5],
                  });
                  Col.delete(button.guildId);
                  aC.stop();
                  require("../music/assets/.js").delete(button.guildId);
                  break;
                case "loop":
                  if (guildData.loop == true) {
                    guildData.loop = false;
                  } else {
                    guildData.loop = true;
                  }
                  break;
                case "skip":
                  guildData.player.stop();
                  break;
                case "shuffle":
                  let newSongs = [];
                  let songs = data?.songs;
                  if (!songs) return;
                  await [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0,
                  ].forEach(() => {
                    let number = Math.floor(Math.random() * (songs.length - 0));
                    if (!newSongs.includes(songs[number]))
                      newSongs.push(songs[number]);
                  });
                  await setTimeout(() => {
                    songs = newSongs;
                  }, 1987);
                  break;
                case "back":
                  if (guildData?.last == null) return;
                  if (guildData?.last == guildData.songs[0]) return;
                  play(button, guildData?.last, true);
                  break;
                case "info":
                  let followUpMessage = `> volume: ${String(
                    resource.volume.volume
                  )
                    .replace("0", "")
                    .split("0")
                    .join("")}
> paused: ${guildData?.pause}
> loop: ${guildData?.loop}
> last song: ${guildData?.last}
> queue length: ${data?.songs?.length}`;
                  button.followUp({
                    content: followUpMessage,
                    ephemeral: true,
                  });
                  break;
                default:
                  return;
              }
            } catch (err) {
              console.log(err);
            }
          });
          events.on("setupStop", async (def) => {
            aC.stop();
            require("../music/assets/.js").delete(button.guildId);
            Col.set(def.guildId, false);
            let embedE = new MessageEmbed()
              .setTitle(`**No song playing currently**`)
              .setDescription("Casper is a life style.")
              .setFooter({
                text: "all the bot commands woking with slashcommands",
              })
              .setImage(
                "https://media.discordapp.net/attachments/950102464701558845/950435985118879786/unnamed.png"
              );
            msg?.edit({
              embeds: [embedE],
            });
          });
        });
      }, 314);
    });
  }
};
