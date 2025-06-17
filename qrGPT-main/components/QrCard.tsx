import Image from 'next/image';

type QrCardProps = {
  imageURL?: string;
  time: string;
};

export const QrCard: React.FC<QrCardProps> = ({ imageURL, time }) => {
  if (!imageURL) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Chưa có hình ảnh QR code</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col justify-center items-center gap-y-4 w-[510px] border-2 border-gradient-to-r from-red-200 to-blue-200 rounded-xl shadow-xl bg-white p-4 mx-auto max-w-full hover:shadow-2xl transition-shadow duration-300">
      <Image
        src={imageURL}
        className="rounded "
        alt="qr code"
        width={480}
        height={480}
      />
      <p className="text-gray-400 text-sm italic">
        Tạo QR code trong {time} giây
      </p>
    </div>
  );
};
