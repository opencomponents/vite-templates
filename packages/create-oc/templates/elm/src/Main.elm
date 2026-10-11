port module Main exposing (..)

import Browser
import Css exposing (..)
import Html.Styled exposing (..)
import Html.Styled.Attributes as Attr exposing (css)
import Html.Styled.Events exposing (onClick)
import Json.Decode as D
import Json.Encode as E



-- MAIN


main : Program E.Value Model Msg
main =
    Browser.element
        { init = init
        , view = view >> toUnstyled
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Model =
    { staticPath : String, name : String, year : Int, funFact : Maybe String, error : Maybe String, loading : Bool }


type alias DataRequest =
    { year : Int }


type alias ActionResponse =
    { funFact : String, error : String }


encode : DataRequest -> E.Value
encode data =
    E.object
        [ ( "year", E.int data.year )
        ]


init : E.Value -> ( Model, Cmd Msg )
init flags =
    ( case D.decodeValue decoder flags of
        Ok model ->
            model

        Err _ ->
            { staticPath = "", name = "", year = 0, funFact = Nothing, error = Nothing, loading = False }
    , Cmd.none
    )



-- UPDATE


type Msg
    = GetFunFact
    | Recv E.Value


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GetFunFact ->
            ( { model | loading = True, error = Nothing }, DataRequest model.year |> encode |> askFunFact )

        Recv data ->
            case D.decodeValue responseDecoder data of
                Ok res ->
                    if res.error == "" then
                        ( { model | loading = False, funFact = Just res.funFact }, Cmd.none )

                    else
                        ( { model | loading = False, error = Just res.error }, Cmd.none )

                Err _ ->
                    ( { model | loading = False, error = Just "Something went wrong" }, Cmd.none )



-- VIEW


view : Model -> Html Msg
view model =
    div
        [ css
            [ backgroundColor (hex "0f172a")
            , color (hex "fff")
            , fontFamilies [ "DejaVu Sans", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif" ]
            , padding2 (px 56) (px 24)
            , displayFlex
            , justifyContent center
            ]
        ]
        [ div
            [ css
                [ backgroundColor (hex "ffffff")
                , color (hex "0f172a")
                , borderRadius (px 20)
                , padding (px 32)
                , width (pct 100)
                , maxWidth (px 440)
                , boxShadow5 (px 0) (px 12) (px 32) (px 0) (rgba 2 6 23 0.45)
                ]
            ]
            [ div [ css [ displayFlex, alignItems center, property "gap" "12px", marginBottom (px 20) ] ]
                [ img
                    [ css [ width (px 40), height (px 40), borderRadius (px 12), display block ]
                    , Attr.src (model.staticPath ++ "public/logo.png")
                    , Attr.alt "Logo"
                    ]
                    []
                , p
                    [ css
                        [ margin zero
                        , fontSize (px 12)
                        , fontWeight (int 700)
                        , letterSpacing (Css.em 0.14)
                        , textTransform uppercase
                        , color (hex "4f46e5")
                        ]
                    ]
                    [ text "OpenComponents · Vite" ]
                ]
            , h1
                [ css
                    [ margin4 (px 0) (px 0) (px 8) (px 0)
                    , fontSize (px 30)
                    , lineHeight (num 1.15)
                    , letterSpacing (Css.em -0.02)
                    ]
                ]
                [ text "Hello, "
                , span [ css [ color (hex "4f46e5") ] ] [ text model.name ]
                ]
            , p
                [ css [ margin4 (px 0) (px 0) (px 4) (px 0), fontSize (px 16), color (hex "475569") ] ]
                [ text "Born in "
                , span
                    [ css
                        [ display inlineBlock
                        , backgroundColor (hex "eef2ff")
                        , color (hex "4338ca")
                        , borderRadius (px 999)
                        , padding2 (px 2) (px 12)
                        , fontWeight (int 700)
                        ]
                    ]
                    [ text (String.fromInt model.year) ]
                ]
            , case model.funFact of
                Nothing ->
                    text ""

                Just fact ->
                    div
                        [ css
                            [ marginTop (px 20)
                            , backgroundColor (hex "eef2ff")
                            , borderLeft3 (px 4) solid (hex "4f46e5")
                            , borderRadius4 (px 0) (px 12) (px 12) (px 0)
                            , padding2 (px 14) (px 16)
                            , fontSize (px 15)
                            , lineHeight (num 1.5)
                            , color (hex "1e1b4b")
                            ]
                        ]
                        [ text fact ]
            , case model.error of
                Nothing ->
                    text ""

                Just message ->
                    div
                        [ css
                            [ marginTop (px 20)
                            , backgroundColor (hex "fef2f2")
                            , borderLeft3 (px 4) solid (hex "ef4444")
                            , borderRadius4 (px 0) (px 12) (px 12) (px 0)
                            , padding2 (px 14) (px 16)
                            , fontSize (px 15)
                            , lineHeight (num 1.5)
                            , color (hex "991b1b")
                            ]
                        ]
                        [ text message ]
            , button
                [ css
                    [ marginTop (px 20)
                    , width (pct 100)
                    , backgroundColor (hex "4f46e5")
                    , color (hex "fff")
                    , border (px 0)
                    , borderRadius (px 12)
                    , padding2 (px 12) (px 24)
                    , fontSize (px 15)
                    , fontWeight (int 600)
                    , cursor pointer
                    , opacity (num (if model.loading then 0.6 else 1))
                    , hover [ backgroundColor (hex "4338ca") ]
                    ]
                , onClick GetFunFact
                , Attr.disabled model.loading
                ]
                [ text
                    (if model.loading then
                        "Loading…"

                     else
                        "Fun year fact"
                    )
                ]
            ]
        ]



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    getFunFact Recv


decoder : D.Decoder Model
decoder =
    D.map3
        (\staticPath name year ->
            { staticPath = staticPath, name = name, year = year, funFact = Nothing, error = Nothing, loading = False }
        )
        (D.field "staticPath" D.string)
        (D.field "name" D.string)
        (D.field "year" D.int)


responseDecoder : D.Decoder ActionResponse
responseDecoder =
    D.map2 ActionResponse
        (D.field "funFact" D.string)
        (D.field "error" D.string)



-- PORTS


port askFunFact : E.Value -> Cmd msg


port getFunFact : (E.Value -> msg) -> Sub msg
