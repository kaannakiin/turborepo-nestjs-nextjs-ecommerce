import { Dictionary } from "@blocknote/core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tr: Dictionary & Record<string, any> = {
  slash_menu: {
    // --- BAŞLIKLAR GRUBU ---
    heading: {
      title: "Başlık 1",
      subtext: "En üst seviye başlık",
      aliases: ["h", "baslik1", "h1"],
      group: "Başlıklar",
    },
    heading_2: {
      title: "Başlık 2",
      subtext: "Ana bölüm başlığı",
      aliases: ["h2", "baslik2", "altbaslik"],
      group: "Başlıklar",
    },
    heading_3: {
      title: "Başlık 3",
      subtext: "Alt bölüm ve grup başlığı",
      aliases: ["h3", "baslik3", "altbaslik"],
      group: "Başlıklar",
    },

    // --- ALT BAŞLIKLAR GRUBU ---
    heading_4: {
      title: "Başlık 4",
      subtext: "Küçük alt bölüm başlığı",
      aliases: ["h4", "baslik4", "altbaslik4"],
      group: "Alt Başlıklar",
    },
    heading_5: {
      title: "Başlık 5",
      subtext: "Daha küçük alt bölüm başlığı",
      aliases: ["h5", "baslik5", "altbaslik5"],
      group: "Alt Başlıklar",
    },
    heading_6: {
      title: "Başlık 6",
      subtext: "En düşük seviye başlık",
      aliases: ["h6", "baslik6", "altbaslik6"],
      group: "Alt Başlıklar",
    },
    toggle_heading: {
      title: "Açılır Başlık 1",
      subtext: "Açılır-kapanır en üst seviye başlık",
      aliases: ["h", "baslik1", "h1", "acilir"],
      group: "Alt Başlıklar",
    },
    toggle_heading_2: {
      title: "Açılır Başlık 2",
      subtext: "Açılır-kapanır ana bölüm başlığı",
      aliases: ["h2", "baslik2", "altbaslik", "acilir"],
      group: "Alt Başlıklar",
    },
    toggle_heading_3: {
      title: "Açılır Başlık 3",
      subtext: "Açılır-kapanır alt bölüm başlığı",
      aliases: ["h3", "baslik3", "altbaslik", "acilir"],
      group: "Alt Başlıklar",
    },

    // --- TEMEL BLOKLAR GRUBU ---
    quote: {
      title: "Alıntı",
      subtext: "Alıntı veya özlü söz",
      aliases: ["alinti", "blokalinti", "bq"],
      group: "Temel Bloklar",
    },
    toggle_list: {
      title: "Açılır Liste",
      subtext: "Gizlenebilir alt öğelere sahip liste",
      aliases: ["li", "liste", "acilirliste", "acilir liste"],
      group: "Temel Bloklar",
    },
    numbered_list: {
      title: "Numaralı Liste",
      subtext: "Sıralı öğelere sahip liste",
      aliases: ["ol", "li", "liste", "numaraliliste", "numarali liste"],
      group: "Temel Bloklar",
    },
    bullet_list: {
      title: "Maddeli Liste",
      subtext: "Sırasız öğelere sahip liste",
      aliases: ["ul", "li", "liste", "maddeliliste", "maddeli liste"],
      group: "Temel Bloklar",
    },
    check_list: {
      title: "Kontrol Listesi",
      subtext: "Onay kutularına sahip liste",
      aliases: [
        "ul",
        "li",
        "liste",
        "checklist",
        "kontrol listesi",
        "onay listesi",
        "onaykutusu",
      ],
      group: "Temel Bloklar",
    },
    paragraph: {
      title: "Metin", // "Paragraf" yerine "Metin" daha kullanıcı dostu
      subtext: "Belgenizin ana gövdesi",
      aliases: ["p", "paragraf", "metin"],
      group: "Temel Bloklar",
    },
    code_block: {
      title: "Kod Bloğu",
      subtext: "Sözdizimi vurgulamalı kod bloğu",
      aliases: ["kod", "pre"],
      group: "Temel Bloklar",
    },
    page_break: {
      title: "Sayfa Sonu",
      subtext: "Sayfa ayırıcı",
      aliases: ["sayfa", "son", "ayirici"],
      group: "Temel Bloklar",
    },
    divider: {
      title: "Ayırıcı",
      subtext: "Blokları görsel olarak ayırın",
      aliases: ["ayirici", "hr", "cizgi", "yatay cizgi"],
      group: "Temel Bloklar",
    },

    // --- GELİŞMİŞ GRUBU ---
    table: {
      title: "Tablo",
      subtext: "Düzenlenebilir hücrelere sahip tablo",
      aliases: ["tablo"],
      group: "Gelişmiş",
    },

    // --- MEDYA GRUBU ---
    image: {
      title: "Resim",
      subtext: "Alt yazılı, yeniden boyutlandırılabilir resim",
      aliases: [
        "resim",
        "resimyukle",
        "yukle",
        "img",
        "gorsel",
        "medya",
        "url",
      ],
      group: "Medya",
    },
    video: {
      title: "Video",
      subtext: "Alt yazılı, yeniden boyutlandırılabilir video",
      aliases: ["video", "videoyukle", "yukle", "mp4", "film", "medya", "url"],
      group: "Medya",
    },
    audio: {
      title: "Ses",
      subtext: "Alt yazılı, gömülü ses dosyası",
      aliases: ["ses", "sesyukle", "yukle", "mp3", "sound", "medya", "url"],
      group: "Medya",
    },
    file: {
      title: "Dosya",
      subtext: "Gömülü dosya",
      aliases: ["dosya", "yukle", "gom", "medya", "url"],
      group: "Medya",
    },

    // --- DİĞER GRUBU ---
    emoji: {
      title: "Emoji",
      subtext: "Emoji arayın ve ekleyin",
      aliases: ["emoji", "ifade", "yuz"],
      group: "Diğer",
    },
  },
  placeholders: {
    default: "Metin girin veya komutlar için '/' yazın",
    heading: "Başlık",
    toggleListItem: "Açılır öğe",
    bulletListItem: "Liste",
    numberedListItem: "Liste",
    checkListItem: "Liste",
    emptyDocument: undefined,
    new_comment: "Yorum yazın...",
    edit_comment: "Yorumu düzenle...",
    comment_reply: "Yorum ekle...",
  } as Record<string | "default" | "emptyDocument", string | undefined>,
  file_blocks: {
    add_button_text: {
      image: "Resim Ekle",
      video: "Video Ekle",
      audio: "Ses Ekle",
      file: "Dosya Ekle",
    } as Record<string, string>,
  },
  toggle_blocks: {
    add_block_button: "Boş açılır blok. Blok eklemek için tıklayın.",
  },
  side_menu: {
    add_block_label: "Blok ekle",
    drag_handle_label: "Blok menüsünü aç",
  },
  drag_handle: {
    delete_menuitem: "Sil",
    colors_menuitem: "Renkler",
    header_row_menuitem: "Başlık Satırı",
    header_column_menuitem: "Başlık Sütunu",
  },
  table_handle: {
    delete_column_menuitem: "Sütunu Sil",
    delete_row_menuitem: "Satırı Sil",
    add_left_menuitem: "Sola Sütun Ekle",
    add_right_menuitem: "Sağa Sütun Ekle",
    add_above_menuitem: "Yukarıya Satır Ekle",
    add_below_menuitem: "Aşağıya Satır Ekle",
    split_cell_menuitem: "Hücreyi Böl",
    merge_cells_menuitem: "Hücreleri Birleştir",
    background_color_menuitem: "Arkaplan Rengi",
  },
  suggestion_menu: {
    no_items_title: "Hiçbir öğe bulunamadı",
  },
  color_picker: {
    text_title: "Metin",
    background_title: "Arkaplan",
    colors: {
      default: "Varsayılan",
      gray: "Gri",
      brown: "Kahverengi",
      red: "Kırmızı",
      orange: "Turuncu",
      yellow: "Sarı",
      green: "Yeşil",
      blue: "Mavi",
      purple: "Mor",
      pink: "Pembe",
    },
  },

  formatting_toolbar: {
    bold: {
      tooltip: "Kalın",
      secondary_tooltip: "Mod+B",
    },
    italic: {
      tooltip: "İtalik",
      secondary_tooltip: "Mod+I",
    },
    underline: {
      tooltip: "Altı Çizili",
      secondary_tooltip: "Mod+U",
    },
    strike: {
      tooltip: "Üstü Çizili",
      secondary_tooltip: "Mod+Shift+S",
    },
    code: {
      tooltip: "Kod",
      secondary_tooltip: "",
    },
    colors: {
      tooltip: "Renkler",
    },
    link: {
      tooltip: "Bağlantı oluştur",
      secondary_tooltip: "Mod+K",
    },
    file_caption: {
      tooltip: "Alt yazıyı düzenle",
      input_placeholder: "Alt yazıyı düzenle",
    },
    file_replace: {
      tooltip: {
        image: "Resmi değiştir",
        video: "Videoyu değiştir",
        audio: "Sesi değiştir",
        file: "Dosyayı değiştir",
      } as Record<string, string>,
    },
    file_rename: {
      tooltip: {
        image: "Resmi yeniden adlandır",
        video: "Videoyu yeniden adlandır",
        audio: "Sesi yeniden adlandır",
        file: "Dosyayı yeniden adlandır",
      } as Record<string, string>,
      input_placeholder: {
        image: "Resmi yeniden adlandır",
        video: "Videoyu yeniden adlandır",
        audio: "Sesi yeniden adlandır",
        file: "Dosyayı yeniden adlandır",
      } as Record<string, string>,
    },
    file_download: {
      tooltip: {
        image: "Resmi indir",
        video: "Videoyu indir",
        audio: "Sesi indir",
        file: "Dosyayı indir",
      } as Record<string, string>,
    },
    file_delete: {
      tooltip: {
        image: "Resmi sil",
        video: "Videoyu sil",
        audio: "Sesi sil",
        file: "Dosyayı sil",
      } as Record<string, string>,
    },
    file_preview_toggle: {
      tooltip: "Önizlemeyi aç/kapat",
    },
    nest: {
      tooltip: "Girintiyi artır",
      secondary_tooltip: "Tab",
    },
    unnest: {
      tooltip: "Girintiyi azalt",
      secondary_tooltip: "Shift+Tab",
    },
    align_left: {
      tooltip: "Sola hizala",
    },
    align_center: {
      tooltip: "Ortala",
    },
    align_right: {
      tooltip: "Sağa hizala",
    },
    align_justify: {
      tooltip: "İki yana yasla",
    },
    table_cell_merge: {
      tooltip: "Hücreleri birleştir",
    },
    comment: {
      tooltip: "Yorum ekle",
    },
  },
  file_panel: {
    upload: {
      title: "Yükle",
      file_placeholder: {
        image: "Resim yükle",
        video: "Video yükle",
        audio: "Ses yükle",
        file: "Dosya yükle",
      } as Record<string, string>,
      upload_error: "Hata: Yükleme başarısız oldu",
    },
    embed: {
      title: "Göm",
      embed_button: {
        image: "Resmi göm",
        video: "Videoyu göm",
        audio: "Sesi göm",
        file: "Dosyayı göm",
      } as Record<string, string>,
      url_placeholder: "URL girin",
    },
  },
  link_toolbar: {
    delete: {
      tooltip: "Bağlantıyı kaldır",
    },
    edit: {
      text: "Bağlantıyı düzenle",
      tooltip: "Düzenle",
    },
    open: {
      tooltip: "Yeni sekmede aç",
    },
    form: {
      title_placeholder: "Başlığı düzenle",
      url_placeholder: "URL'yi düzenle",
    },
  },
  comments: {
    edited: "düzenlendi",
    save_button_text: "Kaydet",
    cancel_button_text: "İptal",
    actions: {
      add_reaction: "Tepki ekle",
      resolve: "Çöz",
      edit_comment: "Yorumu düzenle",
      delete_comment: "Yorumu sil",
      more_actions: "Daha fazla işlem",
    },
    reactions: {
      reacted_by: "Tepki veren:",
    },
    sidebar: {
      marked_as_resolved: "Çözüldü olarak işaretlendi",
      more_replies: (count: number) => `${count} yanıt daha`,
    },
  },
  generic: {
    ctrl_shortcut: "Ctrl",
  },

  ai: {
    formatting_toolbar: {
      ai: {
        tooltip: "Yapay Zekaya Sor",
      },
    },
    slash_menu: {
      ai: {
        title: "Yapay Zekaya Sor",
        subtext: "Yapay zeka komutlarını kullan",
        aliases: ["yz", "ai", "yapayzeka", "asistan"],
        group: "Yapay Zeka",
      },
    },
    ai_default_commands: {
      continue_writing: {
        title: "Yazmaya Devam Et",
        aliases: undefined,
      },
      summarize: {
        title: "Özetle",
        aliases: undefined,
      },
      add_action_items: {
        title: "Eylem Öğeleri Ekle",
        aliases: undefined,
      },
      write_anything: {
        title: "Herhangi Bir Şey Yaz",
        aliases: undefined,
        prompt_placeholder: "Ne hakkında yazmak istersin?",
      },
      simplify: {
        title: "Sadeleştir",
        aliases: undefined,
      },
      translate: {
        title: "Çevir",
        aliases: undefined,
        prompt_placeholder: "Hangi dile?",
      },
      fix_spelling: {
        title: "Yazım ve Dilbilgisini Düzelt",
        aliases: undefined,
      },
      improve_writing: {
        title: "Yazıyı Geliştir",
        aliases: undefined,
      },
    },
    ai_menu: {
      input_placeholder: "Yapay zekaya sor...",
      status: {
        thinking: "Düşünülüyor...",
        editing: "Düzenleniyor...",
        error: "Hata",
      },
      actions: {
        accept: {
          title: "Kabul Et",
          aliases: undefined,
        },
        retry: {
          title: "Yeniden Dene",
          aliases: undefined,
        },
        cancel: {
          title: "İptal",
          aliases: undefined,
        },
        revert: {
          title: "Geri Al",
          aliases: undefined,
        },
      },
    },
  },
};
