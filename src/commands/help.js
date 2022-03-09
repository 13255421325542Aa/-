const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const fs = require("fs").promises;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Display the help menu."),

  /**
   *
   * @param {Client} client
   * @param {CommandInteraction<import("discord.js").CacheType>} interaction
   */

  run: async (client, interaction) => {
    let embed = new MessageEmbed()
      .setAuthor({
        name: "Help Menu!.",
        iconURL:
          "https://media.discordapp.net/attachments/928708617505472592/948691437913006111/unknown.png",
      })
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setColor("AQUA");
    (await fs.readdir(__dirname + "/")).forEach((file) => {
        let json = file?.data?.toJSON()
      if (json?.name == module.exports.data.toJSON().name) return;
      let command = require("./" + file)?.data?.toJSON();
      embed.addField(
        command?.name || "كسم السيسي",
        command?.description || "كسم السيسي",
        true
      );
    });
    interaction.followUp({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
