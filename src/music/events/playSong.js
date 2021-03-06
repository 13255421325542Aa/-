const player = require("../../clients/player");
const replys = require("../../modules/replys.json");
const data = require("../assets/.js");
const { MessageActionRow, MessageButton, Client } = require("discord.js");

/**
 *
 * @param {Client} client
 */
module.exports = (client) => {
  let row = new MessageActionRow().setComponents(
    new MessageButton()
      .setEmoji("â¯ī¸")
      .setCustomId("play_pause")
      .setStyle("SECONDARY"),
    new MessageButton()
      .setEmoji("âšī¸")
      .setCustomId("stop")
      .setStyle("SECONDARY"),
    new MessageButton()
      .setEmoji("đ")
      .setCustomId("volume_up")
      .setStyle("SECONDARY"),
    new MessageButton()
      .setEmoji("đ")
      .setCustomId("volume_down")
      .setStyle("SECONDARY"),
    new MessageButton().setEmoji("đ").setCustomId("loop").setStyle("SECONDARY")
  );

  player.events.on("playSong", (def, song) => {
    def
      .editReply({
        content: replys.donePlayingMusic
          .replace("{song[title]}", song.title)
          .replace("{song[url]}", song.url),
        components: [row],
      })
      .catch(() => {})
      .then((i) => {
        i.createMessageComponentCollector({
          componentType: "BUTTON",
          time: 1000 * 60 * 60 * 24,
          filter: (iU) =>
            iU.member.voice.channel &&
            def.guild.me.voice.channel &&
            iU.member.voice.channel?.id == def.guild.me.voice.channel?.id,
        }).on("collect", async (button) => {
          await button.deferUpdate().catch(() => {});
          let guildData = data.get(button.guild.id);
          switch (button.customId) {
            case "play_pause":
              if (guildData.pause == false) {
                guildData?.player.pause();
                guildData.pause = true;
              } else {
                guildData?.player.unpause();
                guildData.pause = false;
              }
              break;
            case "volume_up":
              guildData?.resource.volume.setVolume(
                guildData?.resource.volume.volume + 0.2
              );
              button.followUp({
                content: replys.volumeUpdate.replace(
                  "{volume[volume]}",
                  guildData?.resource.volume.volume
                ),
                ephemeral: true,
                allowedMentions: {
                  repliedUser: false,
                },
              });
              break;
            case "volume_down":
              guildData?.resource.volume.setVolume(
                guildData?.resource.volume.volume - 0.2
              );
              button.followUp({
                content: replys.volumeUpdate.replace(
                  "{volume[volume]}",
                  guildData?.resource.volume.volume
                ),
                ephemeral: true,
                allowedMentions: {
                  repliedUser: false,
                },
              });
              break;
            case "stop":
              if (guildData) guildData.connection.destroy(true);
              data.delete(button.guild.id);
              break;
            case "loop":
              if (guildData.loop == true) {
                guildData.loop = false;
              } else {
                guildData.loop = true;
              }
              button.followUp({
                content: replys.loopUpdate.replace(
                  "{loop[status]}",
                  guildData.loop
                ),
                ephemeral: true,
                allowedMentions: {
                  repliedUser: false,
                },
              });
              break;
            default:
              return;
          }
        });
      });
  });
};
