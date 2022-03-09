const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client, CommandInteraction, MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("fwfgw"),

  /**
   *
   * @param {Client} client
   * @param {CommandInteraction<import("discord.js").CacheType>} interaction
   */

  run: async (client, interaction) => {
    const embed = new MessageEmbed()
      .setAuthor({
        name: interaction.member.user.username,
        iconURL: interaction.member.user.displayAvatarURL({
          size: 2048,
          dynamic: true,
          format: "png",
        }),
      })
      .setTitle("Pong 🏓")
      .setThumbnail(
        interaction.guild.iconURL({ size: 2048, dynamic: true, format: "png" })
      )
      .setColor("RANDOM")
      .setDescription(
        `**${Date.now() - interaction.createdTimestamp}` + `ms.**\n${client.ws.ping}`
      )
      .setFooter({
        text: interaction.guild.name,
      })
      .setTimestamp();
    interaction.followUp({ embeds: [embed] });
  },
};
