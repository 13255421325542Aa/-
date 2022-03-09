const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  Client,
  CommandInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const db = require("quick.db");
const replys = require("../modules/replys.json");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Setup the quick play channel.")
    .addChannelOption((channel) =>
      channel
        .setName("channel")
        .setRequired(true)
        .setDescription("The channel you won't setup.")
    ),

  /**
   *
   * @param {Client} client
   * @param {CommandInteraction<import("discord.js").CacheType>} interaction
   */

  run: async (client, interaction) => {
    let channel = interaction.guild.channels.cache.get(
      interaction.options.getChannel("channel").id
    );
    let row = new MessageActionRow().setComponents(
      new MessageButton()
        .setEmoji("⏯️")
        .setCustomId("play_pause")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setEmoji("⏹️")
        .setCustomId("stop")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setEmoji("🔊")
        .setCustomId("volume_up")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setEmoji("🔉")
        .setCustomId("volume_down")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setEmoji("🔂")
        .setCustomId("loop")
        .setStyle("SECONDARY")
    );
    let كسم_تربو = new MessageActionRow().setComponents(
      new MessageButton()
        .setEmoji("⏭️")
        .setCustomId("skip")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setEmoji("🔀")
        .setCustomId("shuffle")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setEmoji("↩️")
        .setCustomId("back")
        .setStyle("SECONDARY"),
        new MessageButton()
        .setEmoji("❓")
        .setCustomId("info")
        .setStyle("SECONDARY"),

    )
    let embed = new MessageEmbed()
      .setTitle(`**No song playing currently**`)
      .setDescription("Casper is a life style.")
      .setFooter({
        text: "all the bot commands woking with slashcommands",
      })
      .setImage(
        "https://media.discordapp.net/attachments/950102464701558845/950435985118879786/unnamed.png"
      );
    channel
      .send({
        content:
          "**__Queue list__**:\nJoin a voice channel and queue songs by name or url in here.",
        embeds: [embed],
        components: [row, كسم_تربو],
      })
      .then((message) => {
        db.set(`Channel_${interaction.guildId}`, {
          channel: channel,
          messsageId: message ?.id,
        });
        interaction.followUp({
          ephemeral: true,
          content: replys.doneSetupTheChannel.replace(
            "{channel[name]",
            channel.name
          ),
        });
      });
  },
};
