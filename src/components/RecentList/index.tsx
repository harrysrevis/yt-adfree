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

export default function RecentList(props: {
  items: string[]
  onClickVideo: (id: string) => void
  onClear: () => void
}) {
  const { items, onClear, onClickVideo } = props

  if (!items.length) return <></>

  return (
    <>
      {items.length > 0 && (
        <Stack marginTop={45}>
          <HStack justify="space-between" align="center">
            <Heading size="lg">Your Recent Searches</Heading>
            <Button paddingX={15} size="sm" variant="ghost" onClick={onClear}>
              <LuTrash2 /> Clear
            </Button>
          </HStack>
          <Separator marginBottom={15} borderColor={"whiteAlpha.500"} />

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={5}>
            {items.map((id) => (
              <Box
                key={id}
                role="group"
                cursor="pointer"
                onClick={() => onClickVideo(id)}
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
                      src={getThumb(id)}
                      alt={`Video ${id}`}
                      objectFit="cover"
                      w="100%"
                      h="100%"
                    />
                    <Box
                      position="absolute"
                      inset={0}
                      bgGradient="linear(to-t, blackAlpha.800 0%, blackAlpha.500 40%, transparent 70%)"
                    />
                    <Text
                      position="absolute"
                      bottom={2}
                      left={3}
                      right={3}
                      fontWeight="semibold"
                      color="whiteAlpha.900"
                      textShadow="0 1px 2px rgba(0,0,0,.6)"
                    >
                      {id}
                    </Text>
                    <Box
                      position="absolute"
                      inset={0}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      opacity={0}
                      transition="opacity .15s ease"
                      _groupHover={{ opacity: 1 }}
                    >
                      <Box
                        rounded="full"
                        bg="whiteAlpha.900"
                        p={3}
                        boxShadow="md"
                      >
                        <Icon size={"lg"}>
                          <LuPlay />
                        </Icon>
                      </Box>
                    </Box>
                  </Box>
                </AspectRatio>
              </Box>
            ))}
          </SimpleGrid>
        </Stack>
      )}
    </>
  )
}
