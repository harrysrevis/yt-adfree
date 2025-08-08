import {
  AspectRatio,
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Image,
  Separator,
  SimpleGrid,
  Stack,
  Text
} from "@chakra-ui/react"
import { LuPlay, LuTrash2 } from "react-icons/lu"
import { getThumb } from "@/utils/url-helpers"
import { VideoInfo } from "@/types"
import { formatDuration } from "@/utils/local-storage"

export default function RecentList(props: {
  items: VideoInfo[]
  onClickVideo: (id: string) => void
  onClear: () => void
}) {
  const { items, onClear, onClickVideo } = props

  if (!items.length) return null

  return (
    <Stack marginTop={45}>
      <HStack justify="space-between" align="center">
        <Heading size="lg">Your Recent Searches</Heading>
        <Button paddingX={15} size="sm" variant="ghost" onClick={onClear}>
          <LuTrash2 /> Clear
        </Button>
      </HStack>
      <Separator marginBottom={15} borderColor={"whiteAlpha.500"} />

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
        {items.map((v) => (
          <Box
            key={v.id}
            role="group"
            cursor="pointer"
            onClick={() => onClickVideo(v.id)}
            rounded="xl"
            overflow="hidden"
            position="relative"
            transition="transform .15s ease, box-shadow .15s ease"
            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
            bg="blackAlpha.300"
            backdropFilter="blur(2px)"
          >
            <AspectRatio ratio={16 / 9}>
              <Box position="relative">
                <Image
                  style={{ position: "relative" }}
                  src={getThumb(v.id)}
                  alt={`Video ${v.id}`}
                  objectFit="cover"
                  w="100%"
                  h="100%"
                />
                {v.durationSeconds && (
                  <Box
                    position="absolute"
                    bottom={2}
                    right={2}
                    bg="white"
                    px={2}
                    py={0.5}
                    rounded="sm"
                    fontSize="xs"
                    fontWeight="semibold"
                    color="black"
                    zIndex={2}
                  >
                    {formatDuration(v.durationSeconds)}
                  </Box>
                )}

                <Text
                  marginRight={20}
                  zIndex={99}
                  position="absolute"
                  bottom={4}
                  left={5}
                  right={5}
                  fontWeight="medium"
                  color="whiteAlpha.900"
                  textShadow="0 1px 2px rgba(0,0,0,.6)"
                >
                  {v.title || "Untitled video"}
                </Text>
                <Box
                  inset={0}
                  position={"absolute"}
                  bgGradient="to-t"
                  gradientFrom="blackAlpha.800"
                  gradientTo="transparent"
                  h={"100%"}
                  w={"100%"}
                />
                <Box
                  position="absolute"
                  inset={0}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  opacity={1}
                  transition="opacity .15s ease"
                  _groupHover={{ opacity: 1 }}
                >
                  <Icon as={LuPlay} size={"xl"} />
                </Box>
              </Box>
            </AspectRatio>
          </Box>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
