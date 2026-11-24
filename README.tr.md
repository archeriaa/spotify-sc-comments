[Click here for English documentation](./README.md)

# Spotify-SoundCloud Yorum Eklentisi

**Spotify Web Player** üzerinde çalan şarkıyı otomatik olarak algılayan, eşleşen parçayı **SoundCloud** üzerinde bulan ve o parçaya ait zaman damgalı (timestamped) yorumları gerçek zamanlı olarak oynatıcı çubuğunun hemen üzerinde gösteren bir Chrome eklentisi.

## Özellikler

- **Otomatik Şarkı Algılama:** Spotify Web Player üzerinde çalan şarkıyı ve sanatçıyı otomatik yakalayıp işlemleri başlatır.
- **Parça Eşleştirme (Önemli):** Spotify'daki bir şarkının SoundCloud'da onlarca kopyası, remixi veya düzenlemesi olabildiği için parçaları puanlar ve yayıncı/etiket, süre benzerliği, tür (genre), etiketler ve metadata bilgilerine göre en yüksek puanlı olanı seçer. (Not: Ne kadar uğraşsam da SoundCloud bazen orijinal parça hariç her remixi gönderebiliyor :D Konsol çıktılarından doğru şarkının seçilip seçilmediğini kontrol edebilirsiniz. Biraz can sıkıcı bir durum ama hala tam bir çözüm bulamadım...)
- **Süre ile Senkronize Yorumlar:** Şarkının o anki saniyesine en yakın yorumları zamanla eşleştirip ekrana basar.
- **Otomatik ClientID Yakalama:** Eklentinin çalışması için SoundCloud `client_id` gerekir. Ağ isteklerini kurcalayıp el ile girmek yerine SoundCloud sitesine girip birkaç saniye beklediğinde `client_id` otomatik yakalanıp `chrome.storage.local` içine kaydedilir.

## Kurulum

1. Repoyu indirin veya klonlayın (`git clone https://github.com/archeriaa/spotify-sc-comments.git`).
2. Chrome'da `chrome://extensions/` adresine gidin ve sağ üstten **Geliştirici modu**nu açın.
3. **Paketlenmemiş öğe yükle** diyerek proje klasörünü seçin.
4. [SoundCloud](https://soundcloud.com) sitesini açıp birkaç saniye bekleyin ki `client_id` kaydolsun.
5. [Spotify Web Player](https://open.spotify.com) açıp bir şarkı başlatın.

## Notlar

- Spotify arayüzündeki bazı süre class'ları güncellemelerde değişebiliyor, gerekirse elden güncellenmesi gerekir.
- SoundCloud'un dahili `api-v2` uç noktaları kullanılıyor, yoğun istekte hız sınırı veya değişiklik yaşanabilir.
- Bu kod tamamen eğlence amacıyla yazılmıştır; sitenizde herhangi bir bozulma veya rate-limit durumu sizin sorumluluğunuzdadır
- Test ederken hiç rate-limit'e takılmadım sitemde bozulmadı :-)

![Demo](./assets/demo.gif)